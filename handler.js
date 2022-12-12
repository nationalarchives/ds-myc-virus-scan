const {
	execSync
} = require("child_process");
const {
	writeFileSync,
	unlinkSync
} = require("fs");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

module.exports.virusScan = async(event, context) => {
	const fileName = decodeURIComponent(record.s3.object.key.replace(/\+g/, " "));

	console.log('Getting the file', fileName, record);

	// get the file
	const s3Object = await s3
		.getObject({
			Bucket: record.s3.bucket.name,
			Key: fileName,
		})
		.promise();

	console.log('Got the file', fileName);

	// write file to disk
	writeFileSync(`/tmp/${fileName}`, s3Object.Body);

	console.log('wrote the file');

	try {
		// scan it
		var result = require('child_process').execSync(`clamscan /tmp/${fileName}`).toString();
		console.log(result);

		const clean_data = JSON.stringify({
				'key': fileName,
				'status': 'clean'
			});
		postVirusScanStatus(clean_data);

		console.log('updated api with status ', clean_data);

		await s3
		.putObjectTagging({
			Bucket: record.s3.bucket.name,
			Key: fileName,
			Tagging: {
				TagSet: [{
						Key: 'av-status',
						Value: 'clean'
					}
				]
			}
		})
		.promise();

		console.log('updated tag as clean');
	} catch (err) {
		console.log('err', err);
		if (err.status === 1) {
			const infected_data = JSON.stringify({
					'key': fileName,
					'status': 'infected'
				});
			postVirusScanStatus(infected_data);
			// tag as infected
			await s3
			.putObjectTagging({
				Bucket: record.s3.bucket.name,
				Key: fileName,
				Tagging: {
					TagSet: [{
							Key: 'av-status',
							Value: 'infected'
						}
					]
				}
			})
			.promise();
			console.log('updated tag as infected');
		} else {
			const error_data = JSON.stringify({
					'key': fileName,
					'status': 'error'
				});
			postVirusScanStatus(error_data);
		}
	}

	// delete the temp file
	unlinkSync(`/tmp/${fileName}`);
};

function postVirusScanStatus(scanStatus) {
	console.log(scanStatus);

	const api_host = process.env.MYC_HOST;
	const api_path = process.env.MYC_PATH;

	console.log(api_host)
	const https = require('https');

	const options = {
		hostname: api_host,
		path: api_path,
		port: 443,
		method: 'POST'
	};

	var req = https.request(options, (res) => {
			console.log('statusCode:', res.statusCode);
			console.log('headers:', res.headers);

			res.on('data', (d) => {
				process.stdout.write(d);
			});
		});

	req.on('error', (e) => {
		console.error(e);
	});

	req.write(scanStatus);
	req.end();
}
