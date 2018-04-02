/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
var https = require('https');
var _ = require('lodash');
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.3a618459-45bb-4fdb-bd22-a36d6e190724';

const SKILL_NAME = 'SPI Cinemas';
const HELP_MESSAGE = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';


var options = {
    host: 'www.spicinemas.in',
    port: 443,
    path: '/chennai/show-times/data',
    method: 'GET',
    headers: { 'User-Agent': 'PostmanRuntime/7.1.1', 'accept':"application/json"}
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('SpiCinemasSearchIntent');
    },
    'SpiCinemasSearchIntent': function () {

        var speechOutput = '';

        var mythis = this;

        console.log(options);
        const req = https.get( options, (res) => {

        var responseBody = '';
        console.log("status code: ", res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (resBody) => {
          console.log('Data received');
            responseBody += resBody;
          });

        res.on('end', function() {
            console.log('***************');
            console.log(responseBody);

            console.log(JSON.parse(responseBody));
            // data = JSON.parse(data);

            var showTimes = JSON.parse(responseBody);

            var movie = mythis.event.request.intent.slots.movie.value;
            let movieDate = mythis.event.request.intent.slots.movieDate.value;
            let screen = mythis.event.request.intent.slots.screen.value;

            let screenSchedules = showTimes.screenSchedules;
            console.log('&&&&&&&&&&');
            console.log(screenSchedules);
            console.log(movie);

            var results = _.filter(screenSchedules, function(e) { return e.movieName.toUpperCase() == movie.toUpperCase() || e.sluggedMovieName == movie});

            console.log('#######');
            console.log(results);
            if(results.length == 0) {
                speechOutput = movie + ' is not played';
            } else if(results.length == 1) {
                var showDateTime = new Date(results[0].sessionDetails[0].sessionTiming);
                speechOutput = movie + ' is playing at ' + showDateTime.getHours() + ': ' + showDateTime.getMinutes() + ' in ' + results[0].cinemaName;
            } else if(results.length > 1) {
                speechOutput = movie + ' is playing at ' + getShowTimes(results) + ' in ' + results[0].cinemaName;
            }
            mythis.emit(':tell', speechOutput);

        });

    });

        function getShowTimes(results) {
            var showTimesOutput = [];

            _.each(results, function(o) {
                showTimesOutput.push(new Date(o.sessionDetails[0].sessionTiming).getHours() +  ': ' + new Date(o.sessionDetails[0].sessionTiming).getMinutes());
            });

            return showTimesOutput.join(' and ');
        }

        // this.response.cardRenderer(SKILL_NAME, randomFact);

    },
    'AMAZON.HelpIntent'
        :

        function () {
            const speechOutput = HELP_MESSAGE;

            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }

    ,
    'AMAZON.CancelIntent'
        :

        function () {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        }

    ,
    'AMAZON.StopIntent'
        :

        function () {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        }

    , 'Unhandled': function () {
        const speechOutput = HELP_MESSAGE;

        this.response.speak(speechOutput);
        this.emit(':responseReady');
    }

};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
