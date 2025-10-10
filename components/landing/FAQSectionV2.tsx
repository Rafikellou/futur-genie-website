"use client";

import { useState } from "react";

const faqData = [
  {
    question: "L'outil est-il compliqué pour les enseignants ?",
    answer: "Pas du tout ! Futur Génie a été conçu pour être ultra-simple. Un enseignant peut créer un exercice personnalisé en moins de 30 secondes. L'interface est intuitive et ne nécessite aucune formation technique.",
  },
  {
    question: "Les parents doivent-ils payer ?",
    answer: "Non, les parents n'ont rien à payer. C'est l'école qui souscrit à l'abonnement pour toute la classe. Les parents téléchargent simplement l'application gratuite et reçoivent un code d'accès de l'enseignant.",
  },
  {
    question: "Peut-on tester avant de payer ?",
    answer: "Absolument ! Nous offrons 3 mois d'essai gratuit sans engagement. Cela vous permet de tester toutes les fonctionnalités avec vos élèves et de constater les bénéfices avant de vous engager.",
  },
  {
    question: "Les données des enfants sont-elles protégées ?",
    answer: "La protection des données est notre priorité absolue. Nous respectons le RGPD et toutes les réglementations en vigueur. Les données sont chiffrées, sécurisées et ne sont jamais partagées avec des tiers.",
  },
  {
    question: "Comment les élèves accèdent-ils aux exercices ?",
    answer: "L'enseignant crée les exercices depuis son interface web et les élèves y accèdent via l'application mobile avec un code classe. Les parents peuvent suivre les progrès depuis leur propre espace.",
  },
];

export function FAQSectionV2() {
  return (
    <section id="faq" className="section section-alt">
      <div className="wrapper">
        <h2 className="heading-lg text-center" style={{ marginBottom: "4rem" }}>
          Questions fréquentes
        </h2>

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="card card-solid" style={{ padding: "2.5rem" }}>
            {faqData.map((item, index) => (
              <FAQItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "0.5rem 0",
          textAlign: "left",
        }}
      >
        <span className="heading-sm" style={{ fontSize: "1.125rem", paddingRight: "2rem" }}>
          {question}
        </span>
        <span
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            transition: "transform 0.3s ease",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            color: "var(--accent-purple)",
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <p className="body-md text-muted" style={{ paddingTop: "1rem", lineHeight: 1.7 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}
