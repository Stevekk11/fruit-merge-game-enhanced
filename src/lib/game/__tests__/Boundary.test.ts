import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Boundary } from '../Boundary';
import { RigidBodyDesc, ColliderDesc, ActiveEvents, type World } from '@dimforge/rapier2d-compat';

// Mock Rapier
vi.mock('@dimforge/rapier2d-compat', () => {
	const mockRigidBodyDesc = {
		setTranslation: vi.fn().mockReturnThis()
	};

	const mockColliderDesc = {
		setActiveEvents: vi.fn().mockReturnThis()
	};

	return {
		ActiveEvents: { COLLISION_EVENTS: 1 },
		RigidBodyDesc: {
			fixed: vi.fn(() => mockRigidBodyDesc)
		},
		ColliderDesc: {
			cuboid: vi.fn(() => mockColliderDesc)
		},
		World: vi.fn()
	};
});

describe('Boundary', () => {
	let mockWorld: any;
	let mockRigidBody: any;
	let mockCollider: any;

	beforeEach(() => {
		vi.clearAllMocks();

		mockRigidBody = { testId: 'mock-body' };
		mockCollider = { testId: 'mock-collider' };

		mockWorld = {
			createRigidBody: vi.fn().mockReturnValue(mockRigidBody),
			createCollider: vi.fn().mockReturnValue(mockCollider)
		};
	});

	it('creates a physics boundary with correct dimensions and position', () => {
		const x = 10;
		const y = 20;
		const width = 100;
		const height = 200;

		const boundary = new Boundary(x, y, width, height, mockWorld as unknown as World);

		// Assert RigidBody creation
		expect(RigidBodyDesc.fixed).toHaveBeenCalled();
		// We have to get the mock instance from the mocked fixed() description
		const activeRigidBodyDescMock = vi.mocked(RigidBodyDesc.fixed).mock.results[0].value;
		expect(activeRigidBodyDescMock.setTranslation).toHaveBeenCalledWith(x, y);
		expect(mockWorld.createRigidBody).toHaveBeenCalledWith(activeRigidBodyDescMock);

		// Assert Collider creation
		expect(ColliderDesc.cuboid).toHaveBeenCalledWith(width / 2, height / 2);
		const activeColliderDescMock = vi.mocked(ColliderDesc.cuboid).mock.results[0].value;
		expect(activeColliderDescMock.setActiveEvents).toHaveBeenCalledWith(
			ActiveEvents.COLLISION_EVENTS
		);
		expect(mockWorld.createCollider).toHaveBeenCalledWith(activeColliderDescMock, mockRigidBody);

		// Assert properties
		expect(boundary.body).toBe(mockRigidBody);
		expect(boundary.collider).toBe(mockCollider);
	});
});
