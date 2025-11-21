import { User } from "../models/User/User";
import { Reservation } from "../models/Reservation/Reservation";
import { Equipment } from "../models/Equipment/Equipment";

export class PermissionService {
  static canManageBuildings(user: User): boolean {
    return user.role === "ADMIN";
  }

  static canManageEquipment(user: User): boolean {
    return user.role === "ADMIN" || user.role === "EDITOR";
  }

  /**
   * Check if user can edit equipment management (administrator and vice-administrators)
   * Allowed: ADMIN, EDITOR, Equipment Administrator, or Equipment Vice-Administrator
   */
  static canEditEquipmentManagement(user: User, equipment: Equipment): boolean {
    // Global permissions
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      return true;
    }

    // Equipment-specific permissions
    if (equipment.administratorId === user.id) {
      return true;
    }

    if (equipment.viceAdministratorIds.includes(user.id)) {
      return true;
    }

    return false;
  }

  static canManageReservations(user: User, reservation?: Reservation): boolean {
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      return true;
    }
    // GENERAL user can only manage their own reservations
    if (reservation) {
      return reservation.userId === user.id;
    }
    // If no specific reservation is checked, we assume general capability to manage *some* reservations (their own)
    // But usually this check is for a specific action.
    // For "Can I see the manage button?", it might depend.
    // Let's say for general "can manage" capability (like accessing a dashboard), it's true for everyone as they can manage their own.
    return true;
  }

  static canDeleteReservation(user: User, reservation: Reservation): boolean {
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      return true;
    }
    return reservation.userId === user.id;
  }

  static canReserve(): boolean {
    // All authenticated users (GENERAL, EDITOR, ADMIN) can reserve
    return true;
  }

  static canComment(): boolean {
    // All authenticated users can comment
    return true;
  }
}
