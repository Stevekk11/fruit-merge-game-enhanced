import {
	ActiveEvents,
	type Collider,
	ColliderDesc,
	type RigidBody,
	RigidBodyDesc,
	type World
} from '@dimforge/rapier2d-compat';

import {GAME_WIDTH} from '../constants';

interface BombBodyUserData {
    bombInstance: Bomb;
}

let currentIdNumber = 1;

export class Bomb {
    public readonly id: number;
    public readonly body: RigidBody;
    public readonly collider: Collider;
    public readonly physicsWorld: World;
    public readonly radius: number = GAME_WIDTH / 25; // Roughly 1/25th of game width
    public hitBottom: boolean = false;

    constructor(x: number, y: number, physicsWorld: World) {
        this.id = currentIdNumber++;
        this.physicsWorld = physicsWorld;

        const bodyDesc = RigidBodyDesc.dynamic()
            .setTranslation(x, y)
            .setLinearDamping(0.2)
            .setAngularDamping(0.4);
        this.body = this.physicsWorld.createRigidBody(bodyDesc);

        const colliderDesc = ColliderDesc.ball(this.radius)
            .setRestitution(0.25)
            .setFriction(0.35)
            .setMass(0.15)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS);
        this.collider = this.physicsWorld.createCollider(colliderDesc, this.body);

        if (!this.body.userData) {
            this.body.userData = {};
        }
        (this.body.userData as BombBodyUserData).bombInstance = this;
    }

    isAtBottom(): boolean {
        const bottomOfBombY = this.body.translation().y + this.radius;
        // Check if bomb has hit the bottom floor
        if (this.body.isValid() && bottomOfBombY >= GAME_WIDTH * 1.5) {
            // Estimate game height as 1.5x game width (0.9/0.6)
            this.hitBottom = true;
            return true;
        }
        return false;
    }

    destroy(): void {
        if (this.body && this.collider) {
            this.physicsWorld.removeCollider(this.collider, false);
            this.physicsWorld.removeRigidBody(this.body);
        }
    }
}

