import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { firstName, lastName, email } = req.body;
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email.toLowerCase();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const address = {
      id: Date.now().toString(),
      type: type || 'home',
      street,
      city,
      state,
      zipCode,
      country: country || 'US',
      isDefault: isDefault || false
    };

    if (address.isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { addressId } = req.params;
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const address = user.addresses.find(addr => addr.id === addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (type !== undefined) address.type = type;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
      if (isDefault) {
        user.addresses.forEach(addr => {
          if (addr.id !== addressId) addr.isDefault = false;
        });
      }
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const removeAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.find(addr => addr.id === addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.forEach(addr => {
      addr.isDefault = addr.id === addressId;
    });

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
