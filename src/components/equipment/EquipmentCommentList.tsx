"use client";

import { EquipmentComment } from "@/domain/models/EquipmentComment/EquipmentComment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import {
  createEquipmentCommentAction,
  deleteEquipmentCommentAction,
} from "@/application/actions/equipmentComment";
import { useState, useActionState } from "react";

interface EquipmentCommentListProps {
  comments: EquipmentComment[];
  equipmentId: string;
}

export function EquipmentCommentList({
  comments,
  equipmentId,
}: EquipmentCommentListProps) {
  const [newComment, setNewComment] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const itemsPerPage = 10;
  const [state, formAction, isPending] = useActionState(
    createEquipmentCommentAction,
    null,
  );

  const handleDelete = async (id: string, userId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteEquipmentCommentAction(id, equipmentId, userId);
    setIsDeleting(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
    if (!state?.error) {
      setNewComment("");
      setCurrentPage(1); // Reset to first page after adding a comment
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Pagination calculations
  const totalPages = Math.ceil(sortedComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComments = sortedComments.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <CardTitle>
            Comments {sortedComments.length > 0 && `(${sortedComments.length})`}
          </CardTitle>
          <span className="text-sm text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Existing Comments */}
          {sortedComments.length === 0 ? (
            <p className="text-gray-500">No comments</p>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium text-sm">
                            {comment.author?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(comment.createdAt),
                              "yyyy/MM/dd HH:mm",
                              {
                                locale: ja,
                              },
                            )}
                          </p>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id, comment.userId)}
                        disabled={isDeleting === comment.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} -{" "}
                    {Math.min(endIndex, sortedComments.length)} of{" "}
                    {sortedComments.length} items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-gray-700">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Add Comment Form */}
          <form action={handleSubmit} className="space-y-3">
            <input type="hidden" name="equipmentId" value={equipmentId} />
            <Textarea
              name="content"
              placeholder="Enter a comment..."
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(e.target.value)
              }
              rows={3}
            />
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending || !newComment.trim()}>
              {isPending ? "Submitting..." : "Add Comment"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
