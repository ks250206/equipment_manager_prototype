"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEquipmentCategoryAction,
  deleteEquipmentCategoryAction,
} from "@/application/actions/equipmentCategory";

type EquipmentCategory = {
  id: string;
  categoryMajor: string;
  categoryMinor: string;
};

type Props = {
  categories: EquipmentCategory[];
  userRole?: string;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function CategoryManager({ categories, userRole }: Props) {
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );

  const [categoryState, categoryFormAction, isCategoryCreating] =
    useActionState(createEquipmentCategoryAction, initialState);
  const categoryFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (categoryState.success && categoryFormRef.current) {
      categoryFormRef.current.reset();
    }
  }, [categoryState]);

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm("カテゴリーを削除しますか？");
    if (!confirmed) return;
    setDeletingCategoryId(categoryId);
    const result = await deleteEquipmentCategoryAction(categoryId);
    setDeletingCategoryId(null);
    if (result.error) {
      alert(result.error);
    }
  };

  const canManageEquipment = userRole === "ADMIN" || userRole === "EDITOR";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Management</h2>
      </div>

      {canManageEquipment && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Register Categories</h3>
            <p className="text-sm text-gray-600">
              Register major/minor pairs to classify equipment.
            </p>
          </div>
          <form
            ref={categoryFormRef}
            action={categoryFormAction}
            className="grid gap-4 md:grid-cols-3"
          >
            <div className="grid gap-2">
              <Label htmlFor="categoryMajorInput">Category Major</Label>
              <Input id="categoryMajorInput" name="categoryMajor" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryMinorInput">Category Minor</Label>
              <Input id="categoryMinorInput" name="categoryMinor" required />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isCategoryCreating}
                className="w-full"
              >
                {isCategoryCreating ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </form>
          {categoryState?.error && (
            <div className="text-red-500 text-sm">{categoryState.error}</div>
          )}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Major</th>
                  <th className="px-4 py-2 text-left">Minor</th>
                  {canManageEquipment && (
                    <th className="px-4 py-2 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="px-4 py-2">{category.categoryMajor}</td>
                    <td className="px-4 py-2">{category.categoryMinor}</td>
                    {canManageEquipment && (
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deletingCategoryId === category.id}
                        >
                          {deletingCategoryId === category.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No categories registered. Add one above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!canManageEquipment && (
        <div className="border rounded-lg p-4">
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Major</th>
                  <th className="px-4 py-2 text-left">Minor</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="px-4 py-2">{category.categoryMajor}</td>
                    <td className="px-4 py-2">{category.categoryMinor}</td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No categories registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
