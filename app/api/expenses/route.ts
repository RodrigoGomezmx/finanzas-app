import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('finanzas-app');
    const expenses = database.collection('expenses');
    const result = await expenses.find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json([]);
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  try {
    const expense = await request.json();
    await client.connect();
    const database = client.db('finanzas-app');
    const expenses = database.collection('expenses');
    const result = await expenses.insertOne(expense);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    return NextResponse.json({ error: 'Error al guardar gasto' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await client.connect();
    const database = client.db('finanzas-app');
    const expenses = database.collection('expenses');
    const result = await expenses.deleteOne({ id });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 });
  } finally {
    await client.close();
  }
} 