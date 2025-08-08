import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Groq } from 'groq-sdk'

const app = express()
const PORT = process.env.PORT || 3000

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const GROQ_API_KEY = process.env.GROQ_API_KEY

if (!ACCESS_TOKEN || !GROQ_API_KEY) {
    console.error('Missing ACCESS_TOKEN or GROQ_API_KEY in environment')
}

const client = new Groq({ apiKey: GROQ_API_KEY })
app.use(cors())
app.use(express.json())

app.post('/api/v1/prompt', async (req, res) => {
    if (!validateParams(req.body, res)) return
    const { messages, model } = req.body

    try {
        const response = await client.chat.completions.create({
            model,
            messages,
            temperature: 1,
            max_completion_tokens: 500,
            top_p: 1,
            stream: false,
            //reasoning_effort: "medium",
            stop: null
        })
        const message = response.choices[0].message.content
        return res.status(200).json({ message })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error while trying to call API' })
    }
})

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`)
})

const validateParams = (body, res) => {
    if (!body.token || body.token !== ACCESS_TOKEN) {
        res.status(401).json({ error: 'Invalid token' })
        return false
    }
    if (!body.model) {
        res.status(400).json({ error: 'Model id required' })
        return false
    }
    if (!body.messages) {
        res.status(400).json({ error: 'Prompt required' })
        return false
    }
    return true
}