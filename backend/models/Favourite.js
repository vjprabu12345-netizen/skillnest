import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a user cannot favourite the same resource multiple times
favouriteSchema.index({ user: 1, resource: 1 }, { unique: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);
export default Favourite;
