'use client';

import React from 'react';

const psalms = [
  { ref: "Salmo 23:1", text: "El Señor es mi pastor, nada me falta." },
  { ref: "Salmo 91:1", text: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente." },
  { ref: "Salmo 121:1-2", text: "Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro? Mi socorro viene de Jehová, que hizo los cielos y la tierra." },
  { ref: "Proverbios 3:5-6", text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas." },
  { ref: "Filipenses 4:13", text: "Todo lo puedo en Cristo que me fortalece." },
  { ref: "Isaías 41:10", text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia." },
  { ref: "Josué 1:9", text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas."}
];

const VerseOfTheDay = () => {
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
  
  const dailyVerse = psalms[dayOfYear % psalms.length];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 flex items-center text-gray-800 dark:text-gray-200">
        <span className="text-blue-500 mr-2">+</span> Salmo del Día
      </h2>
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{dailyVerse.ref}</h3>
        <p className="text-gray-600 dark:text-gray-400 italic">&quot;{dailyVerse.text}&quot;</p>
      </div>
    </div>
  );
};

export default VerseOfTheDay; 