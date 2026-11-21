const Template = require('../models/Template');

/**
 * Get templates for organization
 */
exports.getTemplates = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const templates = await Template.find({ orgId }).sort({ createdAt: -1 });
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create new template
 */
exports.createTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { name, layout, signatories, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required.' });
    }

    if (isDefault) {
      await Template.updateMany({ orgId }, { isDefault: false });
    }

    const template = await Template.create({
      name,
      orgId,
      layout: layout || {},
      signatories: signatories || [],
      isDefault: !!isDefault,
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update template
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, layout, signatories, isDefault } = req.body;

    const template = await Template.findOne({ _id: id, orgId: req.user.orgId });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    if (isDefault) {
      await Template.updateMany({ orgId: req.user.orgId }, { isDefault: false });
    }

    if (name) template.name = name;
    if (layout) template.layout = { ...template.layout, ...layout };
    if (signatories) template.signatories = signatories;
    if (isDefault !== undefined) template.isDefault = isDefault;

    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete template
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await Template.findOneAndDelete({ _id: id, orgId: req.user.orgId });
    res.json({ success: true, message: 'Template deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
