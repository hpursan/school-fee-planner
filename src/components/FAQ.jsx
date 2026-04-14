import { useState } from 'react'

const FAQS = [
  {
    q: 'Are these figures accurate for my specific school?',
    a: 'These are planning estimates based on typical fee ranges, not official school quotes. Use the "Enter my actual fee" option to plug in your school\'s real annual fee for a more accurate projection. Always confirm fees directly with the school.'
  },
  {
    q: 'What does "fee inflation" mean and what should I use?',
    a: 'Fee inflation is how much school fees tend to increase each year. South African school fees have historically risen between 6% and 10% annually – often ahead of general CPI. We default to 8% as a conservative-but-realistic estimate. If your school has raised fees sharply in recent years, consider using 9–10%.'
  },
  {
    q: 'What is included in the "annual fee" estimate?',
    a: 'Our tier estimates aim to reflect total annual costs including tuition and standard school levies. They do not include uniforms, stationery, extracurricular activities, camps, transport, or textbooks. Add roughly R5,000–R20,000/year depending on school type for these extras.'
  },
  {
    q: 'What investment return should I use?',
    a: 'This is the nominal annual return you expect on money saved for education. A tax-free savings account (TFSA) invested in a balanced fund might return 8–10% over time. Cash savings accounts currently earn 7–9% but with more stability. A conservative planning assumption is 7–8%.'
  },
  {
    q: 'Should I save a lump sum or monthly contributions?',
    a: 'Both work. If you have existing savings, enter them in "current education savings" and the tool will project how that grows. Monthly contributions benefit from compound growth over time and are often more practical. The tool combines both approaches in the calculation.'
  },
  {
    q: 'What if my child changes school type later?',
    a: 'This tool projects a single school path to matric. For now, run the calculation twice – once for your current plan and once for an alternative – and compare the totals manually. A scenario comparison feature is on the roadmap.'
  },
  {
    q: 'This is not financial advice, right?',
    a: 'Correct. All figures are estimates for planning purposes only. This tool does not account for tax, specific investment products, personal risk tolerance, or your full financial picture. For personalised advice, speak to a registered financial advisor.'
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="faq-list">
      {FAQS.map((faq, i) => (
        <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
          <button className="faq-q" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            {faq.q}
            <span className="faq-chevron">▾</span>
          </button>
          <div className="faq-a">{faq.a}</div>
        </div>
      ))}
    </div>
  )
}
