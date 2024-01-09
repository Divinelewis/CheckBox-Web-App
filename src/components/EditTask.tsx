import { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Category, Task } from "../types/user";
import styled from "@emotion/styled";
import { DESCRIPTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from "../constants";
import { DialogBtn } from "../styles";
import { CategorySelect, ColorPicker, CustomEmojiPicker } from ".";
import toast from "react-hot-toast";
import { UserContext } from "../contexts/UserContext";
import { CancelRounded } from "@mui/icons-material";

interface EditTaskProps {
  open: boolean;
  task?: Task;
  onClose: () => void;
  onSave: (editedTask: Task) => void;
}

export const EditTask = ({ open, task, onClose, onSave }: EditTaskProps) => {
  const { user } = useContext(UserContext);
  const [editedTask, setEditedTask] = useState<Task | undefined>(task);
  const [nameError, setNameError] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<boolean>(false);
  const [emoji, setEmoji] = useState<string | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  // Effect hook to update the editedTask with the selected emoji.
  useEffect(() => {
    setEditedTask((prevTask) => ({
      ...(prevTask as Task),
      emoji: emoji,
    }));
  }, [emoji]);

  // Effect hook to update the editedTask when the task prop changes.
  useEffect(() => {
    setEditedTask(task);
    setSelectedCategories(task?.category as Category[]);
  }, [task]);

  // Event handler for input changes in the form fields.
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Update name error state if the name length exceeds the maximum allowed.

    if (name === "name" && value.length > TASK_NAME_MAX_LENGTH) {
      setNameError(true);
    } else {
      setNameError(false);
    }
    // Update description error state if the description length exceeds the maximum allowed.
    if (name === "description" && value.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(true);
    } else {
      setDescriptionError(false);
    }
    // Update the editedTask state with the changed value.
    setEditedTask((prevTask) => ({
      ...(prevTask as Task),
      [name]: value,
    }));
  };
  // Event handler for saving the edited task.
  const handleSave = () => {
    document.body.style.overflow = "auto";
    if (editedTask && !nameError && !descriptionError) {
      onSave(editedTask);
      toast.success(
        <div>
          Task <b>{editedTask.name}</b> updated.
        </div>
      );
    }
  };

  const handleCancel = () => {
    onClose();
    setEditedTask(task);
    setSelectedCategories(task?.category as Category[]);
    // toast("Canceled editing task.");
  };

  // Event handler for category change in the Select dropdown.
  // const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
  //   const categoryId = event.target.value as number;
  //   const selectedCategory = user.categories.find(
  //     (category) => category.id === categoryId
  //   );

  //   setEditedTask((prevTask) => ({
  //     ...(prevTask as Task),
  //     category: selectedCategory ? [selectedCategory] : undefined,
  //   }));
  // };

  useEffect(() => {
    setEditedTask((prevTask) => ({
      ...(prevTask as Task),
      category: (selectedCategories as Category[]) || undefined,
    }));
  }, [selectedCategories]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setEditedTask(task);
        setSelectedCategories(task?.category as Category[]);
      }}
      PaperProps={{
        style: {
          borderRadius: "24px",
          padding: "12px",
          maxWidth: "600px",
        },
      }}
    >
      <DialogTitle
        sx={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span>Edit Task</span>
        {editedTask?.lastSave && (
          <LastEdit>
            Last Edited: {new Date(editedTask?.lastSave).toLocaleDateString()}
            {" • "}
            {new Date(editedTask?.lastSave).toLocaleTimeString()}
          </LastEdit>
        )}
      </DialogTitle>
      <DialogContent>
        <CustomEmojiPicker
          emoji={editedTask?.emoji || undefined}
          setEmoji={setEmoji}
          color={editedTask?.color}
          width="400px"
        />
        <StyledInput
          label="Name"
          name="name"
          value={editedTask?.name || ""}
          onChange={handleInputChange}
          fullWidth
          error={nameError || editedTask?.name === ""}
          helperText={
            editedTask?.name === ""
              ? "Name is required"
              : nameError
              ? `Name should be less than or equal to ${TASK_NAME_MAX_LENGTH} characters`
              : undefined
          }
        />
        <StyledInput
          label="Description"
          name="description"
          value={editedTask?.description || ""}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          error={descriptionError}
          helperText={
            descriptionError &&
            `Description is too long (maximum ${DESCRIPTION_MAX_LENGTH} characters)`
          }
        />
        <StyledInput
          label="Deadline date"
          name="deadline"
          type="datetime-local"
          value={editedTask?.deadline || ""}
          onChange={handleInputChange}
          fullWidth
          defaultValue=""
          InputLabelProps={{ shrink: true }}
          sx={{
            " & .MuiInputBase-root": {
              transition: ".3s all",
            },
          }}
          InputProps={{
            startAdornment: editedTask?.deadline ? (
              <InputAdornment position="start">
                <Tooltip title="Clear">
                  <IconButton
                    color="error"
                    onClick={() => {
                      setEditedTask((prevTask) => ({
                        ...(prevTask as Task),
                        deadline: undefined,
                      }));
                    }}
                  >
                    <CancelRounded />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : undefined,
          }}
        />
        {user.settings[0].enableCategories !== undefined && user.settings[0].enableCategories && (
          <>
            <Label>Category</Label>
            <CategorySelect
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />

            {/* {editedTask?.category &&
                editedTask.category.length > 0 &&
                !user.categories.some(
                  (category) =>
                    editedTask.category &&
                    editedTask.category[0] &&
                    category.id === editedTask.category[0].id
                ) && (
                  <div style={{ margin: "8px 0" }}>
                    <span>
                      Category <b>{editedTask.category[0]?.name}</b> has been
                      deleted
                      <br />
                      <Button
                        sx={{
                          padding: "8px 12px",
                          margin: "8px 0",
                          borderRadius: "12px",
                        }}
                        onClick={() => {
                          if (editedTask.category && editedTask.category[0]) {
                            const updatedCategories = [
                              ...user.categories,
                              editedTask.category[0],
                            ];

                            setUser((prevUser) => ({
                              ...prevUser,
                              categories: updatedCategories,
                            }));
                          }
                        }}
                      >
                        <Restore /> &nbsp; restore category
                      </Button>
                    </span>
                  </div>
                )} */}
          </>
        )}
        <Label>Color</Label>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ColorPicker
            width={"100%"}
            color={editedTask?.color || "#000000"}
            onColorChange={(color) => {
              setEditedTask((prevTask) => ({
                ...(prevTask as Task),
                color: color,
              }));
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <DialogBtn onClick={handleCancel}>Cancel</DialogBtn>
        <DialogBtn
          onClick={handleSave}
          color="primary"
          disabled={nameError || editedTask?.name === ""}
        >
          Save
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
};

const StyledInput = styled(TextField)`
  margin: 14px 0;

  & .MuiInputBase-root {
    border-radius: 16px;
  }
`;

const Label = styled(Typography)`
  margin-left: 8px;
  font-weight: 500;
  font-size: 16px;
`;

// const StyledSelect = styled(Select)`
//   border-radius: 16px;
//   transition: 0.3s all;

//   margin: 8px 0;
// `;

const LastEdit = styled.span`
  font-size: 14px;
  font-style: italic;
  font-weight: 400;
  opacity: 0.8;
`;
