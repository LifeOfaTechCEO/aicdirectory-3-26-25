import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    id: String,
    title: String,
    name: String,
    description: String,
    logo: String,
    slug: String,
    longDescription: [String],
    pros: [String],
    cons: [String],
    website: String,
    useCases: [String],
    pricing: String,
    easeOfUse: String,
    aicdContributor: String,
    aicdContributorLink: String
}, { strict: false });

const CategorySchema = new mongoose.Schema({
    id: String,
    title: String,
    count: Number,
    icon: String,
    items: [ItemSchema]
}, { strict: false });

const SectionSchema = new mongoose.Schema({
    id: String,
    title: String,
    categories: [CategorySchema]
}, { strict: false });

export default mongoose.models.Section || mongoose.model('Section', SectionSchema); 