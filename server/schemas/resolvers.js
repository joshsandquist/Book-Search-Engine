const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models')
const { signToken } = require('../utils/auth')

const resolvers = {
    //Resolver to query a user
    //Populating user with savedBooks
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({_id :context.user._id}).populate('savedBooks')
            }
            throw new AuthenticationError('You need to be logged in!')
        },
    },

    Mutation: {

    }
}