const Mutations = {
    async createTrack(parent, args, ctx, info) {
        const track = await ctx.db.mutation.createTrack({
            data: { 
                // fullname: args.fullname
                ...args
            }
        }, info);
        return track
    },
    async updateTrack(parent, args, ctx, info) {
        // const track = await ctx.db.mutation
        const updates = {...args};
        delete updates.id
        return ctx.db.mutation.updateTrack({
            data: updates,
            where: {
                id: args.id
            },
        }, info)
    }
};

module.exports = Mutations;
