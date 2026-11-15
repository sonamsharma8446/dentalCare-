export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">DentalCare Kit</p>
        <p className="mx-auto mt-2 max-w-2xl">
          The information on this website is for general education only and is not a substitute for
          professional dental advice, diagnosis or treatment. Always read the product label and
          consult a dentist if you have concerns.
        </p>
        <p className="mt-4">&copy; {new Date().getFullYear()} DentalCare Kit</p>
      </div>
    </footer>
  );
}
