const mongoCollections = require('../config/mongoCollections');
const systemConfigs = mongoCollections.systemConfigs;
const topics = ["Books", "Music", "Movies", "Wine", "Cooking", "Travel", "Other"]

let exportedMethods = {
    async getTopics() {
		const configCollection = await systemConfigs();
		const topicList = await configCollection.find({}).toArray()
		if(topicList.length ===0) throw 'systemConfig is empty'
		return topicList[0].topics
	},
    async initialTopics(){
        const configCollection = await systemConfigs();
        const removeInfo = await configCollection.deleteMany({});
        const insertInfo = await configCollection.insertOne({topics:topics});
        if (insertInfo.insertedCount === 0) throw 'Error: could not initial topics'
        let newId = insertInfo.insertedId.toString()
        let result = Object.assign({}, {topics:topics});
        result['_id'] = newId;
        return result;

    },
    async addTopic (newTopic){
        if(!newTopic) throw 'You need to provide a topic';
        if(typeof newTopic !== 'string' || newTopic.trim() === '') throw ' New topic should be a non-empty string';
        const configCollection = await systemConfigs();
        const updatedInfo = await configCollection.updateOne({},{$addToSet:{topics:newTopic.trim()}});
        if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
            throw 'Nothing being updated.'
        }
    }


};

module.exports = exportedMethods;
