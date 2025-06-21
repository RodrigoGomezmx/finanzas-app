import { NextResponse } from 'next/server';
import { connectDB } from '../../../../utils/db';
import Expense from '../../../../models/Expense';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'Se requiere el ID del gasto' }, { status: 400 });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json({ message: 'Gasto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gasto eliminado' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar el gasto:', error);
    return NextResponse.json({ message: 'Error al eliminar el gasto', error }, { status: 500 });
  }
} 