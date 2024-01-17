import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/customers/create-form';

import { customersPath } from '@/app/lib/constants';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: customersPath },
          {
            label: 'Add Customer',
            href: `${customersPath}/create`,
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
