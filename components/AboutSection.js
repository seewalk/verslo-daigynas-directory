import React from 'react';

const AboutSection = () => {
  return (
    <section className="py-12 px-6 md:px-16 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <img
            src="/about.jpg"
            alt="Apie Verslo Daigyną"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Apie Verslo Daigyną</h3>
          <p className="text-gray-700 text-base leading-relaxed">
            Verslo Daigynas – tai iniciatyva, gimusi iš poreikio suteikti lengvesnį startą mažiems verslams.
            Čia jungiame juridinių asmenų bendruomenę. Šie asmenys teikia įvairius įrankius ir paslaugas jūsų verlso augimui, 
            ko pasekoje jūsų verlsas tampa geriau matomas Lietuvos rinkoje.
          </p>
          <p className="text-gray-600 text-base mt-4">
            Dirbame ne tik kaip bendruomenės vystytojai, bet ir kaip partneris – siūlome papildomas paslaugas,
            kurios padeda Jūsų verslui ne tik startuoti, bet ir augti tvariai.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;