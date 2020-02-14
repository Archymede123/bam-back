const Parser = require('icecast-parser');

const radioStation = new Parser({
    url: 'http://176.175.17.23:8001/', // URL to radio station
    userAgent: 'Parse-Icy', // userAgent to request
    keepListen: false, // don't listen radio station after metadata was received
    autoUpdate: true, // update metadata after interval
    //   errorInterval: 10 * 60, // retry connection after 10 minutes
    //   emptyInterval: 5 * 60, // retry get metadata after 5 minutes
    //   metadataInterval: 30, // update metadata after 5 seconds
});

const Subscription = {
    createTracks: {
        subscribe: (parent, args, ctx, info) => {
            const channel = Math.random().toString(36).substring(2, 15)
            radioStation.on('metadata', function (metadata) {
                ctx.pubsub.publish(channel, { createTracks: { fullName: metadata.StreamTitle}})
            });
            return ctx.pubsub.asyncIterator(channel)
        },
    }
};


module.exports = Subscription;
