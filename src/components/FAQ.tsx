import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    { key: 'q1', question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { key: 'q2', question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { key: 'q3', question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { key: 'q4', question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { key: 'q5', question: t('faq.q5.question'), answer: t('faq.q5.answer') },
    { key: 'q6', question: t('faq.q6.question'), answer: t('faq.q6.answer') },
    { key: 'q7', question: t('faq.q7.question'), answer: t('faq.q7.answer') },
    { key: 'q8', question: t('faq.q8.question'), answer: t('faq.q8.answer') },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.key} value={faq.key} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
