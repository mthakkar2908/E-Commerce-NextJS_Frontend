import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const FAQs = () => {
  return (
    <div className='mx-auto my-10 max-w-4xl px-4'>
      <h1 className='text-center text-2xl font-semibold mb-6'>FAQ</h1>

      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='item-1' className='w-full'>
          <AccordionTrigger>Product Information</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-4'>
            <p>
              Our flagship product combines cutting-edge technology with sleek
              design.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='item-2' className='w-full'>
          <AccordionTrigger>Shipping Details</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-4'>
            <p>We offer worldwide shipping through trusted courier partners.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='item-3' className='w-full'>
          <AccordionTrigger>Return Policy</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-4'>
            <p>
              We stand behind our products with a comprehensive 30-day return
              policy.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQs;
