// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
let https = require('https');
const request = require('request');
const rp = require('request-promise');
const axios = require('axios');
var unirest = require("unirest");
var admin = require("firebase-admin");
const stripHtml = require("string-strip-html");
const xml2js = require('xml2js');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('');
const translate = require('translate');
translate.engine = 'yandex';
translate.key = ''

admin.initializeApp({
  databaseURL: "https://delhihackathon-scnobk.firebaseio.com"
});


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Hey! welcome`);
  }

  function storeFeedback(agent) {
    let school = agent.parameters.school;
    let city = agent.parameters.city;
    let rating = agent.parameters.rating;
    var db = admin.database().ref();
    var ref = db.child("Feedback");
    var cityRef = ref.child(city);
    var schoolRef = cityRef.child(school);
    var pushFeedback = schoolRef.push(rating);
    agent.add('Your feedback was registered');
  }

  function requestFacilities(agent) {
    let facilities = agent.parameters.facilities;
    var db = admin.database().ref();
    var ref = db.child("Facilities");
    var pushFeedback = ref.push(facilities);
    agent.add('Your request was registered');
  }

  function generalQuery(agent) {
    const API = 'http://1619f3b2.ngrok.io/search';
    const PARAMS = agent.parameters.entity;
    const URL = `${API}/${PARAMS.split(' ').join('+')}`;

    return axios.get(URL).then(res => res.data.result).then(result => agent.add(result));
  }
  
  function compExamListIntent(agent){
    agent.add("1. National Talent Search Examination or NTSE:\nTo be held on: May 10, 2020\nSubjects: Science, Mathematics, Social Science, Mental Ability and General Awareness\nConducting Body: National Council of Educational Research and Training (NCERT)\n\n2. Kishore Vigyan Protsahan Yojana or KVPY:\nTo be held on: November 03, 2020\nSubjects: Maths, Physics, Biology, Chemistry\n\n3. International Maths Olympiad Syllabus:\nTo be held on: 13 August, 2020\n Subjects: Mathematical Reasoning, Everyday Mathematics, Statistics");
  }

  function navigationIntent(agent) {
    const source = agent.parameters.source;
    const destination = agent.parameters.destination;
    console.log(source, destination);
    const API = 'https://maps.googleapis.com/maps/api/directions/json';
    const params = {
      origin: source.split(' ').join('+'),
      destination: destination.split(' ').join('+'),
      key: ''
    };
    const paramString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const URL = `${API}?${paramString}`;
    return axios.get(URL)
      .then(res => res.data.routes[0].legs[0])
      .then(data => {
        let steps = [];
        data.steps.map(
          step => steps.push({
            distance: step.distance.text,
            duration: step.duration.text,
            instructions: stripHtml(step.html_instructions)
          }));
        return {
          totalDistance: data.distance.text,
          totalDuration: data.duration.text,
          startAddress: `${source}: ${data.start_address}`,
          endAddress: `${destination}: ${data.end_address}`,
          steps: steps
        };
      })
      .then(data => {
        let steps = data.steps;
        delete data.steps;
        let navigationString = Object.keys(data).map(key => `${key}: ${data[key]}`).join('  \n');
        let stepsString = [];
        steps.map((step, index) => stepsString.push(`${index + 1}. [${step.distance}] [${step.duration}] ${step.instructions}`)).join('  \n');
        let string_ = [navigationString, stepsString.join('  \n')].join('  \n');
        console.log(string_);
        agent.add(string_);
      })
      .catch(() => agent.add("Please specify a more general source/destination"));
  }

  function spaceFactIntent(agent) {
    const API = 'https://glacial-refuge-02108.herokuapp.com/space-facts';
    return axios.get(API).then(res => res.data.data).then(result => agent.add(result));
  }

  function solveEquationIntent(agent) {
    const parser = new xml2js.Parser();
    const API = 'http://api.wolframalpha.com/v2/query';
    const key = '';
    const equation = agent.parameters.equation;
    const URL = `${API}?appid=${key}&input=solve+${equation.split(' ').join('')}&podstate=Result__Step-by-step+solution&format=plaintext`;
    console.log(URL);
    return axios.get(URL)
      .then(res => res.data)
      .then(res => parser.parseString(res, function (err, result) { 
      	let ans_arr = result.queryresult.pod[1].subpod; 
      	let last_index = ans_arr.length;
        let ans = ans_arr[last_index-1].plaintext[0];
      	console.log(ans); 
      	agent.add(ans); }));
  }


  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function newsHeadlinesIntent(agent) {
    var final_response = "";
    return newsapi.v2.topHeadlines({
      country: 'in',
    }).then(function (response) {
      final_response += ("Lets get you updated! \n1. " + response.articles[0].title + ":  " + response.articles[0].description + "\n\n2. " + response.articles[1].title + ": " + response.articles[1].description + "\n\n3. " + response.articles[2].title + ": " + response.articles[2].description);
      return (final_response);
    }).then(function (resp) { agent.add(resp); });
  }

  function getWordMeaning(agent) {
    console.log(`I am searching for word meaning`);
    let url = "https://wordsapiv1.p.rapidapi.com/words/";
    let query = encodeURI(agent.parameters.word);
    let resp = "";
    let request_params = {
      method: 'GET',
      uri: url + query,
      headers: {
        'x-rapidapi-host': "wordsapiv1.p.rapidapi.com",
        'User-Agent': 'Request-Promise',
        'x-rapidapi-key': ''
      }
    };
    return rp(request_params)
      .then(function (body) {
        resp = JSON.parse(body);
        // processing code
        console.log(resp);
        var agentResponse = "";
        var word = resp.word;
        var meaning = resp.results[0].definition;
        var pos = resp.results[0].partOfSpeech;
        var syllableList = resp.syllables.list;
        var syllables = "";
        syllableList.forEach(syl => {
          syllables += syl + "-";
        });
        syllables = syllables.substring(0, syllables.length - 1);
        agentResponse += word + "\n Meaning : " + meaning + "\n Part of Speech : " + pos + "\n Pronounced as : " + syllables;
        console.log(agentResponse);
        agent.add(agentResponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log(err);
      });
  }

  function wordOfTheDay(agent) {
    console.log(`I am searching for word of the day`);
    let url = "https://api.wordnik.com/v4/words.json/wordOfTheDay?date=";
    var year = Math.ceil(Math.random() * (2019 - 2012) + 2012);
    var mon = Math.ceil(Math.random() * (12 - 1) + 1);
    var day = Math.ceil(Math.random() * (28 - 1) + 1);
    var query = year + "-" + mon + "-" + day + "&api_key=";
    console.log(query);
    let request_params = {
      method: 'GET',
      uri: url + query,
      headers: {
        'User-Agent': 'Request-Promise',
        'Accept': 'application/json'
      }
    };
    return rp(request_params)
      .then(function (body) {
        let resp = JSON.parse(body);
        // processing code
        console.log(resp);
        var agentResponse = "";
        agentResponse += resp.word + "\n" + resp.definitions[0].text + "\n Part of Speech" + resp.definitions[0].partOfSpeech + "\n" + resp.examples[0].text;
        agent.add(agentResponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log(err);
      });
  }

  function getSentenceForWord(agent) {
    console.log(`I am searching for sentence`);
    let url = "https://wordsapiv1.p.rapidapi.com/words/";
    let query = encodeURI(agent.parameters.word);
    let resp = "";
    let request_params = {
      method: 'GET',
      uri: url + query + "/examples",
      headers: {
        'x-rapidapi-host': "wordsapiv1.p.rapidapi.com",
        'User-Agent': 'Request-Promise',
        'x-rapidapi-key': ''
      }
    };
    return rp(request_params)
      .then(function (body) {
        resp = JSON.parse(body);
        // processing code
        console.log(resp);
        var agentResponse = "Some examples : \n";
        var sentenceList = resp.examples;
        var len = sentenceList.length;
        if (len > 3)
          len = 3;
        for (var i = 0; i < len; i++)
          agentResponse += sentenceList[i] + " \n ";

        console.log(agentResponse);
        agent.add(agentResponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log(err);
      });
  }

  function getSynonymForString(agent) {
    console.log(`I am searching for synonyms`);
    let url = "https://api.datamuse.com/words?ml=";
    let query = encodeURI(agent.parameters.phrase);
    var queryArray = query.split(",");
    var phrase = "";
    queryArray.forEach(w => {
      phrase += phrase + " ";
    });
    let resp = "";
    let request_params = {
      method: 'GET',
      uri: url + query,
      headers: {
        'x-rapidapi-host': "wordsapiv1.p.rapidapi.com",
        'User-Agent': 'Request-Promise',
        'x-rapidapi-key': ''
      }
    };
    return rp(request_params)
      .then(function (body) {
        resp = JSON.parse(body);
        // processing code
        console.log(resp);
        var agentResponse = "Words most similar to " + phrase + " ";
        var numWords = resp.length;
        if (numWords > 4)
          numWords = 4;

        for (var i = 0; i < numWords; i++)
          agentResponse += resp[i].word + " , ";

        console.log(agentResponse);
        agent.add(agentResponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log(err);
      });
  }

  function translateIntent(agent) {
    let word = agent.parameters.word;
    return translate(word, { from: 'en', to: 'hi' }).then(text => {
      agent.add(text);
    });
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GeneralQuery', generalQuery);
  intentMap.set('WordOfTheDay', wordOfTheDay);
  intentMap.set('WordMeaning', getWordMeaning);
  intentMap.set('ExampleSentenceQuery', getSentenceForWord);
  intentMap.set('SynonymQuery', getSynonymForString);
  intentMap.set('FeedbackIntent', storeFeedback);
  intentMap.set('FacilitiesIntent', requestFacilities);
  intentMap.set('NavigationIntent', navigationIntent);
  intentMap.set('SpaceFactIntent', spaceFactIntent);
  intentMap.set('SolveEquationIntent', solveEquationIntent);
  intentMap.set('NewsHeadlinesIntent', newsHeadlinesIntent);
  intentMap.set('CompExamListIntent', compExamListIntent);
  intentMap.set('TranslateIntent', translateIntent);

  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

