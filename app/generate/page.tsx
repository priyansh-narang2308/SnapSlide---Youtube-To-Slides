import GenerateForm from '@/components/GenerateForm'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Generate = async () => {


    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        redirect("/auth-callback")
    }

    return (
        <div>
            <GenerateForm/>
        </div>
    )
}

export default Generate