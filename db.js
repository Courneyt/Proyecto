require("dotenv").config();
const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		category: {
			type: [String],
			validate: {
				validator: function (value) {
					const validTypes = ["Abstracto", "Retrato", "Paisaje", "Macro", "Urbano"]

					const typeValid = value.map((t) => validTypes.includes(t))

					return typeValid.includes(true)
				},
				message: 'Se ha introducido una categoría inválida.'
			}
		},

		"location": {
			type: String,
			trim: true,
		},
		"lens": {
			type: String,
			required: true,
			enum: ["Canon 50mm 1.8", "Canon EF 100mm F2/8", "Canon EF135mm F/2", "Sony DT 18-55mm f/3.5"],
		},
		"camera": {
			type: String,
			required: true,
			enum: ["Canon EOS 4000D", "Canon EOS 5D Mark IV", "Canon EOS 2000D", "Sony Alpha A3000", "Sony Evil Alpha 7 M3"],

		},
		"description": {
			type: String,
			trim: true,
		},

		dateAndTime: {
			type: Date,
			default: new Date(),
		},

		scores: [Number],

		img: {
			type: String,
			required: true,
		},

		photographer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Photographer',
			autopopulate: true,
		},

	},
	{
		methods: {
			rate: async function (score) {
				this.scores.push(score);
				return await this.save();
			},
		},
		virtuals: {
			averageScore: {
				get() {
					if (this.scores.length > 0)
						return (
							this.scores.reduce((acc, value) => acc + value, 0) /
							this.scores.length
						).toFixed(1);
					else return NaN;
				},
			},
			displayDate: {
				get() {
					return this.dateAndTime.toLocaleString();
				},
			},
		},
		toJSON: { virtuals: true },
	}
);

PhotoSchema.plugin(require('mongoose-autopopulate'));

const PhotographerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLenght: 4
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			minLenght: 1,
			maxLenght: 35
		},
		level: {
			type: String,
			required: true,
			enum: ["Experto", "Principiante", "Intermedio"],
		},
		scores: [Number],
		phone: {
			type: String,
			trim: true,
			validate: {
				validator: function (v) {
					return /\d{3}-\d{3}-\d{3}/.test(v);
				},
				message: props => `${props.value} número de teléfono no válido!`
			},
		},
		gallery: [PhotoSchema]

	},
	{
		methods: {
			rate: async function (score) {
				this.scores.push(score);
				return await this.save();
			},
		},
		virtuals: {
			averageScore: {
				get() {
					if (this.scores.length > 0)
						return (
							this.scores.reduce((acc, value) => acc + value, 0) /
							this.scores.length
						).toFixed(1);
					else return NaN;
				},
			},
		},
		toJSON: { virtuals: true },
	}
);

const Photographer = new mongoose.model("Photographer", PhotographerSchema);
const Photo = new mongoose.model("Photo", PhotoSchema);

exports.connect = async function () {
	mongoose.set("strictQuery", false);
	await mongoose.connect(process.env.MONGODB_URL)
};


exports.close = async function () {
	await mongoose.disconnect();
};

exports.find = async function (params) {
	const query = Photo.find()
		.where("types")
		.in(params.tipos);
	return await query.exec();
};


exports.findPhotoById = async function (photoId) {
	return await Photo.findById(photoId);
};

exports.findPhotographersByName = async function (name) {
	return await Photographer.find({ "name": name });
};

exports.savePhoto = async function (photoData) {
	try {
		const photo = new Photo(photoData);
		return await photo.save();
	} catch (err) {
		return undefined;
	}
};

exports.savePhotographer = async function (photographerData) {
	try {
		const photographer = new Photographer(photographerData);
		return await photographer.save();
	} catch (err) {
		return undefined;
	}
};

exports.ratePhoto = async function (photoId, score) {
	const photo = await Photo.findById(photoId);
	if (photo) return await photo.ratePhoto(score);
	else return undefined;
};

exports.ratePhotographer = async function (photographerId, score) {
	const photographer = await Photographer.findById(photographerId);
	if (photographer) return await photographer.ratePhotographer(score);
	else return undefined;
};

exports.deletePhotoById = async function (photoId) {
	return (await Photo.deleteOne({ _id: photoId })).deletedCount == 1;
};

exports.deletePhotoByType = async function (type) {
	return (await Photo.deleteMany({ types: type }));
};

exports.updatePhotographer = async function (photographerId, name, phone, email) {
	const photographer = await Photographer.findById(photographerId);
	if (photographer) return await photographer.updateOne({ "name": name, "phone": phone, "email": email }, { runValidators: true });
	else return undefined;
}