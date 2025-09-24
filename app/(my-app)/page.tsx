import Image from "next/image";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Font Test</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Default System Font:</h2>
        <p className="text-xl">This text uses the default system font</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Oswald Font (Applied to Body):</h2>
        <p className="text-xl">This text should be in Oswald font (applied to entire body)</p>
        <p className="text-lg" style={{ fontFamily: "var(--font-oswald), Oswald, sans-serif" }}>
          This text uses inline style with Oswald
        </p>
        <p className="text-base font-oswald">This text uses the font-oswald class</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Dancing Script Font (Very Different):</h2>
        <p className="text-xl" style={{ fontFamily: "var(--font-dancing-script), Dancing Script, cursive" }}>
          This text uses Dancing Script - you should see a VERY different font style!
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Comparison:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4">
            <h3 className="font-bold mb-2">System Font</h3>
            <p style={{ fontFamily: "system-ui, sans-serif" }}>The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="border p-4">
            <h3 className="font-bold mb-2">Oswald</h3>
            <p style={{ fontFamily: "var(--font-oswald), Oswald, sans-serif" }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div className="border p-4">
            <h3 className="font-bold mb-2">Dancing Script</h3>
            <p style={{ fontFamily: "var(--font-dancing-script), Dancing Script, cursive" }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
