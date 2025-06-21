import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Falta la variable de entorno MONGODB_URI');
}

async function connectToDbAndCollection() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db('finanzas-app');
  return { client, collection: db.collection('expenses') };
}

// Obtener gastos (puede filtrar por semana: /api/expenses?week=2024-23)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get('week');
  const query = week ? { week } : {};
  
  const { client, collection } = await connectToDbAndCollection();
  try {
    const expenses = await collection.find(query).toArray();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json({ message: 'Error al obtener gastos' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Crear un nuevo gasto
export async function POST(request: Request) {
  const { client, collection } = await connectToDbAndCollection();
  try {
    const expense = await request.json();
    // MongoDB usa _id, no id. Lo quitamos si viene del frontend.
    delete expense._id; 
    delete expense.id;
    
    const result = await collection.insertOne(expense);
    return NextResponse.json({ ...expense, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el gasto:', error);
    return NextResponse.json({ message: 'Error al crear el gasto' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Eliminar un gasto
export async function DELETE(request: Request) {
  const { client, collection } = await connectToDbAndCollection();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Se requiere el ID del gasto' }, { status: 400 });
    }
    
    // El ID en la base de datos es un ObjectId, no un string.
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Gasto no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el gasto:', error);
    return NextResponse.json({ message: 'Error al eliminar el gasto' }, { status: 500 });
  } finally {
    await client.close();
  }
} 