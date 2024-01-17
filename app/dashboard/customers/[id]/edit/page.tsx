import { notFound } from 'next/navigation';

import Form from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

import { fetchCustomerById } from '@/app/lib/data';
import { customersPath } from '@/app/lib/constants';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [customer] = await Promise.all([fetchCustomerById(id)]);

  if (!customer) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: customersPath },
          {
            label: 'Edit Customer',
            href: `${customersPath}/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}
