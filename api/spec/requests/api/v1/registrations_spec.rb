require 'swagger_helper'

RSpec.describe 'Api::V1::Registrations', type: :request do
  path '/api/v1/signup' do
    post 'Create a new account' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :registration, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              email: { type: :string, example: 'newuser@example.com' },
              password: { type: :string, example: 'password123' },
              password_confirmation: { type: :string, example: 'password123' },
              role: { type: :string, example: 'customer', enum: ['customer', 'artist'] }
            },
            required: [ 'email', 'password', 'password_confirmation' ]
          }
        }
      }

      response '201', 'account created' do
        schema type: :object,
               properties: {
                 data: {
                   type: :object,
                   properties: {
                     user: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         email: { type: :string },
                         role: { type: :string }
                       }
                     },
                     token: { type: :string }
                   }
                 },
                 message: { type: :string }
               }
        
        run_test!
      end

      response '422', 'invalid request' do
        run_test!
      end
    end
  end
end
