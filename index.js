'use strict';

const express = require('express')
// will use this later to send requests
const http = require('http')
// import env variables
require('dotenv').config()
const axios = require('axios');

const apiKey = 'dbbb27b7fe6a4567bde3b638eb492d43';


const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.status(200).send('Server is working.')
})

app.listen(port, () => {
	console.log(`🌏 Server is running at http://localhost:${port}`)
})

async function getNews(url) {
	return await axios.get(url)
}

async function fallBack(res) {
	return res.json({
		fulfillmentText: "Sorry what kind of news were you expecting",
		source: 'getNews'
	})
}

async function newsResult(agent, res) {
	const news = agent.parameters.category ? agent.parameters.category : agent.parameters["geo-country"];
	if (news === undefined){
		return res.json({
			"fulfillmentMessages": `Nothing for ${agent.queryText}`,
			source: 'getNews'
		})
	}
	const reqUrl = `http://newsapi.org/v2/top-headlines?q=${news}&apiKey=${apiKey}`
	console.log('URL - ', reqUrl)
	var { data } = await getNews(reqUrl)
	console.log(data)
	if (data.totalResults === 0) {
		return res.json({
			fulfillmentText: "NOTHING FOUND",
			source: 'getNews'
		})
	}
	var article = data.articles.slice(0, 5)
	console.log(article)
	var dataToSend = article.map((temp) => ({
		"text":{
			"text":[temp.title]
		}
	}))
	return res.json({
		"fulfillmentMessages": dataToSend,
		source: 'getNews'
	})
}

app.post('/getNews', async (req, res) => {
	var agent = req.body.queryResult
	if (agent.action === "news.search") {
		// console.log('INSIDE', req)
		return newsResult(agent, res)
	}
	else {
		return fallBack(res)
	}

})