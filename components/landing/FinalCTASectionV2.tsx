import Link from "next/link";

export function FinalCTASectionV2() {
  return (
    <section className="section">
      <div className="wrapper">
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }} className="space-y-lg">
          <h2 className="heading-lg">
            Donnez à vos enseignants et vos élèves l&apos;outil qu&apos;ils méritent
          </h2>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: "1.125rem", padding: "1.25rem 2.5rem" }}>
            Créer un compte école gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
