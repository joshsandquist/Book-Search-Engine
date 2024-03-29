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
        // Mutation to add a user taking in username, email, and password as args
        addUser: async (parent, { username, email, password }, context) => {
            const user = await User.create({ username, email, password});
            const token = signToken(user);
            return {token, user}
        },

        // Login mutation that takes in a email and password as args
        // Searching for user by email
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
        //Throw a general error if no email found
            if (!user) {
              throw new AuthenticationError('Incorrect credentials!');
            }
        //Using bcrypt .isCorrectPassword function to compare stored hashed password with inputted password
            const correctPw = await user.isCorrectPassword(password);
        //Throw error if incorect password
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
        //Sign JWT token
            const token = signToken(user);
            return { token, user };
          },

          //Mutation to save a book to user profile
          //Input arg taken from BookInput type from typeDefs
          saveBook: async (parent, { input }, context ) => {
            //Checking for logged in user
            if (context.user) {
            //using mongoose update method to find user _id that matches context user._id
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                //mongoose operation to add input book to user savedBooks
                    { $addToSet: { savedBooks: input }},
                //return a new copy of the data
                    {new : true}
                );
            return updatedUser
            }
            throw new AuthenticationError('You need to be logged in!')
          },

          //Mutation to remove a book from User
          //Takes in a bookId as an argument
          removeBook: async (parent, { bookId}, context) => {
            //Checks to see if user is validated
            if (context.user) {
                // Using same mongoose findOneandUpdate method to get User
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    // using mongoose pull method to remove item from saveBooks array by id
                    { $pull: { savedBooks: { bookId }}},
                    // Returning updated copy of data again
                    {new: true}
                );
            return updatedUser
            }
            throw new AuthenticationError('You need to be logged in!')
          }
    }
}

module.exports = resolvers