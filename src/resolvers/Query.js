const {forwardTo} = require('prisma-binding');

const Query = {
    tracks: forwardTo('db'),
    track: forwardTo('db'),
    // async tracks(parent, args, ctx, info) {
    //     const tracks = await ctx.db.query.tracks();
    //     return tracks
    // }
};

module.exports = Query;
