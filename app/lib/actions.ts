'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { hash } from 'bcrypt';

import { customersPath, invoicesPath } from '@/app/lib/constants';

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
const UserFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'This field has to be filled.' }),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
  password: z.string().min(6),
});
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'This field has to be filled.' }),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
});

const OmitIdAndDate = InvoiceFormSchema.omit({ id: true, date: true });
const OmitUserId = UserFormSchema.omit({ id: true });
const OmitCustomerId = CustomerFormSchema.omit({ id: true });

export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};
export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

export async function addCustomer(
  _prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = OmitCustomerId.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Add Customer.',
    };
  }

  const { name, email } = validatedFields.data;
  const imageUrl = '/customers/emil-kowalski.png';

  try {
    await sql`
          INSERT INTO customers (name, email, image_url)
          VALUES (${name}, ${email}, ${imageUrl})
        `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Add Customer.',
    };
  }

  revalidatePath(customersPath);
  redirect(customersPath);
}

export async function createInvoice(
  _prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = OmitIdAndDate.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { amount, customerId, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath(invoicesPath);
  redirect(invoicesPath);
}

export async function updateCustomer(
  id: string,
  _prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = OmitCustomerId.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email } = validatedFields.data;
  const imageUrl = '/customers/emil-kowalski.png';

  try {
    await sql`
            UPDATE customers
            SET name = ${name}, email = ${email}, image_url = ${imageUrl}
            WHERE id = ${id}
          `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath(customersPath);
  redirect(customersPath);
}

export async function updateInvoice(
  id: string,
  _prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = OmitIdAndDate.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
          `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath(invoicesPath);
  redirect(invoicesPath);
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath(invoicesPath);
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath(customersPath);
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customer.' };
  }
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials';
        default:
          return 'Something went wrong';
      }
    }
    throw error;
  }
}

export async function addUser(_prevState: UserState, formData: FormData) {
  const validatedFields = OmitUserId.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Sign up',
    };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await hash(password, 10);

  const existingUser = await sql`
        SELECT * FROM users WHERE email = ${email}
    `;

  if (existingUser.rows.length > 0) {
    return { message: 'Email is already in use.' };
  } else {
    try {
      await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
          `;
    } catch (error) {
      return { message: 'Database Error: Failed to Sign Up.' };
    }
  }

  revalidatePath(invoicesPath);
  redirect('/login');
}
