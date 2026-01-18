import { Router } from 'express';
import vehicleController from '../../controllers/vehicle.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { vehicleLookupSchema, vehicleRegistrationSchema } from '../../utils/validators';

const router = Router();

// Vehicle lookup (can be used by anyone, including guests)
router.post('/lookup', optionalAuth, validate(vehicleLookupSchema), vehicleController.lookupVehicle);

// Vehicle registration (protected)
router.post('/register', authenticate, validate(vehicleRegistrationSchema), vehicleController.registerVehicle);

// Vehicle management (protected)
router.get('/:id', authenticate, vehicleController.getVehicle);
router.put('/:id', authenticate, vehicleController.updateVehicle);
router.get('/:id/compliance', optionalAuth, vehicleController.getVehicleCompliance);
router.get('/:id/history', authenticate, vehicleController.getVehicleHistory);

export default router;
