import React from 'react';

const UserBenefitsSection = () => {
  return (
    <section className="bg-gray-50 py-16 px-6 md:px-16">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">Kodėl verta naudotis Verslo Daigynu?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Column 1 */}
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Greita nauda vartotojams</h3>
          <h4 className="text-md text-blue-600 font-medium mb-2">„Sutaupykite laiką ir pasitikėkite patikimais partneriais“</h4>
          <p className="text-sm text-gray-700">
            Greitai raskite verslo adresų registravimo paslaugas, palyginkite kainas ir išsirinkite
            geriausiai tinkantį sprendimą – viskas vienoje vietoje.
          </p>
        </div>

        {/* Column 2 */}
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Bendruomenės rekomendacijos (Jau greitai) </h3>
          <h4 className="text-md text-blue-600 font-medium mb-2">„Pasitikėjimas, paremtas patirtimi“</h4>
          <p className="text-sm text-gray-700">
            Matykite kitų verslų pasirinkimus, atsiliepimus ir rekomendacijas. Būkite užtikrinti,
            kad renkatės patikrintus paslaugų teikėjus.
          </p>
        </div>

        {/* Column 3 */}
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Augimo galimybės (Jau greitai) </h3>
          <h4 className="text-md text-blue-600 font-medium mb-2">„Daugiau nei adresas – platforma Jūsų augimui“</h4>
          <p className="text-sm text-gray-700">
            Raskite papildomas paslaugas (buhalterija, teisė, marketingas) ir auginkite savo verslą
            kartu su patikimais partneriais.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserBenefitsSection;