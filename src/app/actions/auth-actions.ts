'use server'

import {revalidatePath} from 'next/cache'

export async function revalidateAuth() {
    revalidatePath('/', 'layout')
}