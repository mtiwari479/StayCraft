import { MongoClient } from "mongodb"

const options = {}

let client: MongoClient

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable")
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(process.env.MONGODB_URI, options)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  }

  client = new MongoClient(process.env.MONGODB_URI, options)
  return client.connect()
}
