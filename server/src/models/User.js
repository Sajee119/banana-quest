const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        firstName: {
            type: String,
            required: true,
            default: ''
        },
        lastName: {
            type: String,
            required: true,
            default: ''
        },
        avatar: {
            type: String,
            default: null
        },
        provider: [
            {
                name: {
                    type: String,
                    enum: ['google', 'facebook', 'local'],
                    required: true
                },
                providerId: {
                    type: String,
                    required: true
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        lastLogin: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

userSchema.index({ 'providers.providerId': 1, 'providers.name': 1 });
userSchema.index({ email: 1 }, { unique: true });

userSchema.virtual('displayName').get(function () {
    const full = `${this.firstName} ${this.lastName}`.trim();
    return full || this.email.split('@')[0];
});

userSchema.virtual('primaryProvider').get(function () {
    return this.providers.length > 0 ? this.providers[0].name : 'local';
});

userSchema.virtual('providerNames').get(function () {
    return this.providers.map((p) => p.name);
});

userSchema.statics.findOrCreateByProvider = async function (providerName, providerId, profileData) {
    let user = await this.findOne({
        providers: { $elemMatch: { name: providerName, providerId } },
    });

    if (user) {
        user.lastLoginAt = new Date();
        await user.save();
        return { user, isNew: false };
    }

    if (profileData.email) {
        user = await this.findOne({ email: profileData.email });
        if (user) {
        user.providers.push({ name: providerName, providerId });
        user.lastLoginAt = new Date();
        await user.save();
        return { user, isNew: false };
        }
    }

    user = await this.create({
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar,
        providers: [{ name: providerName, providerId }],
    });
    return { user, isNew: true };
};

module.exports = mongoose.model('User', userSchema);