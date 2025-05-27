import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export default function ClaimListingPage() {
  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Pretenduoti į įrašą</h1>
        <p className="text-gray-600 mb-8">
          Jei radote savo įmonę mūsų kataloge ir norite ją administruoti — užpildykite šią formą. Mūsų komanda patikrins
          jūsų užklausą ir susisieks su jumis el. paštu.
        </p>

        <ContactForm />
      </main>

      <Footer />
    </>
  );
}
