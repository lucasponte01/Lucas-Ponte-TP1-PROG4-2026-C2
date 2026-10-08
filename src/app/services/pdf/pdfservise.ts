import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  async generarComprobanteEntrada(datosCompra: {
    idCompra: string;
    pelicula: string;
    fechaFuncion: string;
    butacas: string[]; 
    carrito?: { producto: string; cantidad: number; subtotal: number }[]; 
    total: number;
    nombreUsuario: string;
  }) {
    const doc = new jsPDF();

    // 1. Cabecera del Cine
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(32, 62, 69); 
    doc.text("FOTOGRAMA - COMPROBANTE DE COMPRA", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`ID de Operación: ${datosCompra.idCompra}`, 20, 30);

    doc.setLineWidth(0.5);
    doc.setDrawColor(150, 150, 150); 
    doc.line(20, 35, 190, 35);

    // 2. Detalles de la Función y Butacas
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Detalles de la Función:", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Película: ${datosCompra.pelicula}`, 20, 58);
    doc.text(`Fecha y Hora: ${datosCompra.fechaFuncion}`, 20, 66);
    
    doc.text(`Butacas seleccionadas:`, 20, 74);
    
    let posY = 82;
    for (const butaca of datosCompra.butacas) {
      doc.text(`- ${butaca}`, 25, posY);
      posY += 7; // Incremento controlado por cada butaca
    }

    // 2.1. Detalles del Carrito / Confitería (si existen)
    if (datosCompra.carrito && datosCompra.carrito.length > 0) {
      posY += 4; // Espacio antes del título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Confitería / Productos:", 20, posY);
      
      posY += 8; // Espacio para bajar a los items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const item of datosCompra.carrito) {
        doc.text(`- ${item.cantidad}x ${item.producto} ($ ${item.subtotal})`, 25, posY);
        posY += 7; // Incremento controlado por cada producto
      }
    }

    // Comprador y Totales (ahora usan el posY final acumulado de forma limpia)
    posY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Comprador: ${datosCompra.nombreUsuario}`, 20, posY);
    
    posY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total Abonado: $ ${datosCompra.total}`, 20, posY);

    // 3. Generación del Código QR
    const contenidoQR = `COMPRA-ID:${datosCompra.idCompra}|USUARIO:${datosCompra.nombreUsuario}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(contenidoQR, { width: 150, margin: 1 });
      doc.addImage(qrDataUrl, 'PNG', 130, 45, 50, 50);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Presentá este QR en puerta", 132, 100);
    } catch (error) {
      console.error('Error al generar el código QR para el PDF', error);
    }

    // Pie de página condicionado al último `posY`
    posY += 15;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("¡Gracias por elegirnos! Disfruta de la función.", 20, posY);

    doc.save(`entrada-${datosCompra.idCompra.slice(0, 8)}.pdf`);
  }
}