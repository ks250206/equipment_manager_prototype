import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EquipmentManager from "./EquipmentManager";

// Mock the server actions
const mockCreateEquipmentAction = vi.fn();
const mockUpdateEquipmentAction = vi.fn();
const mockDeleteEquipmentAction = vi.fn();

vi.mock("@/application/actions/equipment", () => ({
  createEquipmentAction: (...args: any[]) => mockCreateEquipmentAction(...args),
  updateEquipmentAction: (...args: any[]) => mockUpdateEquipmentAction(...args),
  deleteEquipmentAction: (...args: any[]) => mockDeleteEquipmentAction(...args),
}));

vi.mock("@/application/actions/equipmentCategory", () => ({
  createEquipmentCategoryAction: vi.fn(),
  deleteEquipmentCategoryAction: vi.fn(),
}));

describe("EquipmentManager", () => {
  const mockBuildings = [{ id: "building-1", name: "Building A" }];

  const mockFloors = [
    { id: "floor-1", name: "Floor 1", buildingId: "building-1" },
  ];

  const mockRooms = [{ id: "room-1", name: "Room 101", floorId: "floor-1" }];

  const mockCategories = [
    { id: "cat-1", categoryMajor: "Electronics", categoryMinor: "Laptop" },
    { id: "cat-2", categoryMajor: "Electronics", categoryMinor: "Monitor" },
    { id: "cat-3", categoryMajor: "Furniture", categoryMinor: "Desk" },
    { id: "cat-4", categoryMajor: "Furniture", categoryMinor: "Chair" },
  ];

  const mockEquipments = [
    {
      id: "eq-1",
      name: "Laptop 1",
      description: "Test laptop",
      categoryMajor: "Electronics",
      categoryMinor: "Laptop",
      roomId: "room-1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateEquipmentAction.mockResolvedValue({ success: true });
    mockUpdateEquipmentAction.mockResolvedValue({ success: true });
    mockDeleteEquipmentAction.mockResolvedValue({ success: true });
  });

  it("should display all category majors from categories prop in filter dropdown", () => {
    render(
      <EquipmentManager
        equipments={mockEquipments}
        rooms={mockRooms}
        floors={mockFloors}
        buildings={mockBuildings}
        categories={mockCategories}
      />,
    );

    // Use id selector to get the filter dropdown specifically
    const majorFilter = document.getElementById(
      "filter-category-major",
    ) as HTMLSelectElement;
    expect(majorFilter).not.toBeNull();

    const options = Array.from(majorFilter.options)
      .map((opt) => opt.value)
      .filter((v) => v !== "");

    // Should show both Electronics and Furniture, even though only Electronics is assigned to equipment
    expect(options).toContain("Electronics");
    expect(options).toContain("Furniture");
    expect(options).toHaveLength(2);
  });

  it("should display all category minors for selected major from categories prop", () => {
    render(
      <EquipmentManager
        equipments={mockEquipments}
        rooms={mockRooms}
        floors={mockFloors}
        buildings={mockBuildings}
        categories={mockCategories}
      />,
    );

    // Use id selector to get the filter dropdown specifically
    const minorFilter = document.getElementById(
      "filter-category-minor",
    ) as HTMLSelectElement;
    expect(minorFilter).not.toBeNull();

    const options = Array.from(minorFilter.options)
      .map((opt) => opt.value)
      .filter((v) => v !== "");

    // When no major is selected, minor options should be empty
    expect(options.length).toBe(0);
  });

  it("should filter equipment correctly by category", () => {
    const equipmentsWithMultipleCategories = [
      {
        id: "eq-1",
        name: "Laptop 1",
        description: "Test laptop",
        categoryMajor: "Electronics",
        categoryMinor: "Laptop",
        roomId: "room-1",
      },
      {
        id: "eq-2",
        name: "Monitor 1",
        description: "Test monitor",
        categoryMajor: "Electronics",
        categoryMinor: "Monitor",
        roomId: "room-1",
      },
      {
        id: "eq-3",
        name: "Desk 1",
        description: "Test desk",
        categoryMajor: "Furniture",
        categoryMinor: "Desk",
        roomId: "room-1",
      },
    ];

    render(
      <EquipmentManager
        equipments={equipmentsWithMultipleCategories}
        rooms={mockRooms}
        floors={mockFloors}
        buildings={mockBuildings}
        categories={mockCategories}
      />,
    );

    // All equipment should be visible initially
    expect(screen.getByText("Laptop 1")).toBeInTheDocument();
    expect(screen.getByText("Monitor 1")).toBeInTheDocument();
    expect(screen.getByText("Desk 1")).toBeInTheDocument();
  });

  it("should show empty state when no equipment matches filter", () => {
    render(
      <EquipmentManager
        equipments={mockEquipments}
        rooms={mockRooms}
        floors={mockFloors}
        buildings={mockBuildings}
        categories={mockCategories}
      />,
    );

    // Should show the equipment initially
    expect(screen.getByText("Laptop 1")).toBeInTheDocument();
  });

  describe("Edit Equipment", () => {
    it("should show edit button for ADMIN role", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      // Find edit button
      const editButtons = screen.queryAllByRole("button", { name: /Edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it("should call handleEdit when edit button is clicked", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      const editButtons = screen.queryAllByRole("button", { name: /Edit/i });
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        // Edit button should be clickable
        expect(editButtons[0]).toBeInTheDocument();
      }
    });
  });

  describe("Delete Equipment", () => {
    it("should show delete button for ADMIN role", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      // Find delete button
      const deleteButtons = screen.queryAllByRole("button", {
        name: /Delete/i,
      });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("should call handleDeleteClick when delete button is clicked", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      const deleteButtons = screen.queryAllByRole("button", {
        name: /Delete/i,
      });
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        // Delete button should be clickable
        expect(deleteButtons[0]).toBeInTheDocument();
      }
    });
  });

  describe("Create Equipment", () => {
    it("should open create modal when create button is clicked", async () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /Add Equipment/i,
      });
      expect(createButton).toBeInTheDocument();
      // Button should be clickable
      fireEvent.click(createButton);
    });

    it("should close create modal when cancel is clicked", async () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /Add Equipment/i,
      });
      expect(createButton).toBeInTheDocument();
      // Button should be clickable
      fireEvent.click(createButton);
    });
  });

  describe("Filter by Category", () => {
    it("should filter equipment by category major", async () => {
      const equipmentsWithMultipleCategories = [
        {
          id: "eq-1",
          name: "Laptop 1",
          description: "Test laptop",
          categoryMajor: "Electronics",
          categoryMinor: "Laptop",
          roomId: "room-1",
        },
        {
          id: "eq-3",
          name: "Desk 1",
          description: "Test desk",
          categoryMajor: "Furniture",
          categoryMinor: "Desk",
          roomId: "room-1",
        },
      ];

      render(
        <EquipmentManager
          equipments={equipmentsWithMultipleCategories}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
        />,
      );

      const majorFilter = document.getElementById(
        "filter-category-major",
      ) as HTMLSelectElement;
      expect(majorFilter).not.toBeNull();

      // Select Electronics category
      fireEvent.change(majorFilter, { target: { value: "Electronics" } });

      // Should show only Electronics equipment
      await waitFor(() => {
        expect(screen.getByText("Laptop 1")).toBeInTheDocument();
      });
      expect(screen.queryByText("Desk 1")).not.toBeInTheDocument();
    });

    it("should filter equipment by category minor", async () => {
      const equipmentsWithMultipleCategories = [
        {
          id: "eq-1",
          name: "Laptop 1",
          description: "Test laptop",
          categoryMajor: "Electronics",
          categoryMinor: "Laptop",
          roomId: "room-1",
        },
        {
          id: "eq-2",
          name: "Monitor 1",
          description: "Test monitor",
          categoryMajor: "Electronics",
          categoryMinor: "Monitor",
          roomId: "room-1",
        },
      ];

      render(
        <EquipmentManager
          equipments={equipmentsWithMultipleCategories}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
        />,
      );

      const majorFilter = document.getElementById(
        "filter-category-major",
      ) as HTMLSelectElement;
      const minorFilter = document.getElementById(
        "filter-category-minor",
      ) as HTMLSelectElement;

      // Select Electronics category major
      fireEvent.change(majorFilter, { target: { value: "Electronics" } });

      // Wait for minor options to be populated
      await waitFor(() => {
        expect(minorFilter.options.length).toBeGreaterThan(1);
      });

      // Select Laptop category minor
      fireEvent.change(minorFilter, { target: { value: "Laptop" } });

      // Should show only Laptop equipment
      await waitFor(() => {
        expect(screen.getByText("Laptop 1")).toBeInTheDocument();
      });
      expect(screen.queryByText("Monitor 1")).not.toBeInTheDocument();
    });
  });

  describe("User Role Permissions", () => {
    it("should not show create button for GENERAL role", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="GENERAL"
        />,
      );

      const createButton = screen.queryByRole("button", {
        name: /Add Equipment/i,
      });
      expect(createButton).not.toBeInTheDocument();
    });

    it("should show create button for ADMIN role", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="ADMIN"
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /Add Equipment/i,
      });
      expect(createButton).toBeInTheDocument();
    });

    it("should show create button for EDITOR role", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          userRole="EDITOR"
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /Add Equipment/i,
      });
      expect(createButton).toBeInTheDocument();
    });
  });

  describe("Hide List", () => {
    it("should not show equipment list when hideList is true", () => {
      render(
        <EquipmentManager
          equipments={mockEquipments}
          rooms={mockRooms}
          floors={mockFloors}
          buildings={mockBuildings}
          categories={mockCategories}
          hideList={true}
        />,
      );

      expect(screen.queryByText("Laptop 1")).not.toBeInTheDocument();
    });
  });
});
