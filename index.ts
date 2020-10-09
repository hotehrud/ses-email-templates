import serverless from 'serverless-http';
import express from 'express';
import AWS from 'aws-sdk';
import bodyParser from 'body-parser';
import awsConfig from './config/aws';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ses = new AWS.SES({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region,
});

app.get('/', (req, res) => {
    res.send('AWS SES - Email Webservice');
});

/**
 * Get an SES Template based on the request data
 */
app.get('/template/:id', (req, res) => {
    const templateName = req.params.id;

    const params = {
        TemplateName: templateName /* required */,
    };
    ses.getTemplate(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

/**
 * Create a new SES Template based on the request data
 */
app.post('/template', (req, res) => {
    const { templateName, subject, body } = req.body;

    const params = {
        Template: {
            TemplateName: templateName,
            HtmlPart: body,
            SubjectPart: subject,
        },
    };

    ses.createTemplate(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(200);
        }
    });
});

/**
 * Update an SES Template based on the request data
 */
app.put('/template', (req, res) => {
    const { templateName, subject, body } = req.body;

    const params = {
        Template: {
            TemplateName: templateName,
            HtmlPart: body,
            SubjectPart: subject,
        },
    };

    ses.updateTemplate(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(200);
        }
    });
});

/**
 * Delete an SES Template based on the request data
 */
app.delete('/template', (req, res) => {
    const { templateName } = req.body;

    const params: any = {
        TemplateName: templateName,
    };

    ses.deleteTemplate(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(200);
        }
    });
});

/**
 * Send Email via AWS SES using the request Template and data
 */
app.post('/send-email', (req, res) => {
    const { templateName, sendTo, data } = req.body;
    const params = {
        Template: templateName,
        Destination: {
            ToAddresses: [sendTo],
        },
        Source: awsConfig.SENDER_EMAIL,
        TemplateData: JSON.stringify(data),
    };

    ses.sendTemplatedEmail(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(200);
        }
    });
});

export const handler = serverless(app);
