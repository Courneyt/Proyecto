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
					const validTypes = ["Ninguna", "Abstracto", "Retrato", "Paisaje", "Macro", "Urbano"]

					const typeValid = value.map((t) => validTypes.includes(t))

					return !typeValid.includes(false)
				},
				message: 'Se ha introducido una categoría inválida.'
			}
		},

		location: {
			type: String,
			trim: true,
		},
		lens: {
			type: String,
			required: true,
			enum: ["Canon 50mm 1.8", "Canon EF 100mm F2/8", "Canon EF135mm F/2", "Sony DT 18-55mm f/3.5"],
		},
		camera: {
			type: String,
			required: true,
			enum: ["Canon EOS 4000D", "Canon EOS 5D Mark IV", "Canon EOS 2000D", "Sony Alpha A3000", "Sony Evil Alpha 7 M3"],

		},
		description: {
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
			type: String,
			required: true,
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
					return this.dateAndTime.toLocaleString("es-ES", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					  });
				},
			},
		},
		toJSON: { virtuals: true },
	}
);

const Photo = new mongoose.model("Photo", PhotoSchema);

// ***********Conexión*********************************
exports.connect = async function () {
	mongoose.set("strictQuery", false);
	await mongoose.connect(process.env.MONGODB_URL)
};

exports.close = async function () {
	await mongoose.disconnect();
};

//***********************Encontrar Fotos***************************/

exports.findPhoto = async function (params) {

	const query = Photo.find().where("category").in(params.categorias);
	return await query.exec();
};

exports.findPhotoByImg = async function (ruta) {
	return await Photo.find({ "img": ruta });
}

exports.findPhotoById = async function (photoId) {
	return await Photo.findById(photoId);
};

//************************* Guardar Fotos ***************************************/

exports.savePhoto = async function (photoData) {
	try {
		const photo = new Photo(photoData);
		return await photo.save();
	} catch (err) {
		return console.error(err);;
	}
};

//***************************Rate Fotos*************************************/

exports.ratePhoto = async function (photoId, score) {
	const photo = await Photo.findById(photoId);
	if (photo) return await photo.rate(score);
	else return undefined;
};

//********************************Borrar Foto********************************************/

exports.deletePhoto = async function (photoId) {
	return (await Photo.deleteOne({ _id: photoId })).deletedCount == 1;
};
