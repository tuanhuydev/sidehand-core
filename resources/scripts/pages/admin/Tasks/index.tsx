import { AppDispatch, Category, DefaultObjectType, Task, User } from 'scripts/utils/interfaces';
import { LOADING_STATE, SEVERITY, SORT_TYPE, TASK_STATUS } from 'scripts/configs/enums';
import { TASK_SEVERITY_OPTIONS, TASK_STATUS_OPTIONS } from 'scripts/configs/constants';
import {
  TaskFilter,
  TaskPaginator,
  TaskParams,
  TaskSorter,
  selectAllTasks,
  selectTaskCategories,
  selectTaskFilter,
  selectTaskLoading,
  selectTaskPaginator,
  selectTaskParams,
  selectTaskSorter,
  taskActions
} from 'scripts/store/slices/taskSlice';
import { adminRoutes } from '../../../components/Router';
import { newTaskSchema } from './schemas';
import { selectCurrentUser } from 'scripts/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import BaseSelect from 'scripts/components/base/Select';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import FormInput from 'scripts/components/form/FormInput';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Input from 'scripts/components/base/Input';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardControlKeyOutlinedIcon from '@mui/icons-material/KeyboardControlKeyOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NorthOutlinedIcon from '@mui/icons-material/NorthOutlined';
import PageContainer from 'scripts/components/base/PageContainer';
import Radio from '@mui/material/Radio';
import React, { ChangeEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Skeleton from '@mui/material/Skeleton';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import TaskForm from './components/TaskForm';
import Typography from '@mui/material/Typography';
import getStyles from './styles';
import omit from 'lodash/omit';
import useDebounce from 'scripts/hooks/useDebounce';

const INITIAL_FORM_VALUES = {
  title: ''
};

const TaskStatusOptions = [{ label: 'All Status', value: 'ALL' }, ...TASK_STATUS_OPTIONS];

const TaskSeverityOptions = [{ label: 'All Severity', value: 'ALL' }, ...TASK_SEVERITY_OPTIONS];

const TaskSortByOptions = [
  { label: 'Date', value: 'createdAt' },
  { label: 'Status', value: 'status' },
  { label: 'Severity', value: 'severity' }
];

const Tasks = () => {
  // Hook
  const dispatch: AppDispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const styles = getStyles();

  // Selectors
  const tasks: Task[] = selectAllTasks();
  const taskParams: TaskParams = selectTaskParams();
  const taskFilter: TaskFilter = selectTaskFilter();
  const taskSorter: TaskSorter = selectTaskSorter();
  const taskCategories: Array<any> = selectTaskCategories();
  const taskPaginator: TaskPaginator = selectTaskPaginator();
  const currentUser: User = selectCurrentUser();
  const loading: string = selectTaskLoading();

  const taskSortOption = TaskSortByOptions.find((option) => option.value === taskSorter.field);
  const isLoading = loading === LOADING_STATE.LOADING;

  const [selectedTask, setSelectedTask] = useState<Task>();
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [search, setSearch] = useState('');
  const debounceSearch: string = useDebounce(search);
  const openMenu = Boolean(menuAnchor);

  const isAscending = taskSorter.value === String(SORT_TYPE.ASCENDING);

  // Handle lazyloading on tasks
  const observer = useRef<any>();
  const lastItemObserver = useCallback(
    (node: any) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && taskPaginator.hasMorePage) {
          // Visible somewhere
          dispatch(
            taskActions.setTaskParams({
              paginator: {
                ...taskPaginator,
                currentPage: taskPaginator.currentPage + 1
              }
            })
          );
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, taskPaginator.hasMorePage]
  );

  // Form
  const { control, getValues, handleSubmit, reset } = useForm({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: yupResolver(newTaskSchema)
  });

  const handleCreateTask = () => {
    const newTask = {
      title: getValues('title'),
      status: TASK_STATUS.BACKLOG,
      severity: SEVERITY.LOW,
      createdBy: currentUser,
      categoryId: taskCategories[0].id, // Unassigned
      category: taskCategories[0],
      createdAt: new Date().toISOString()
    };
    dispatch(taskActions.createTask(newTask));
    reset();
  };

  const handleCompleteTask = (task: Task) => async () => {
    const taskStatus = task.status === TASK_STATUS.DONE ? TASK_STATUS.BACKLOG : TASK_STATUS.DONE;
    dispatch(taskActions.updateTask({ ...task, status: taskStatus }));
  };

  const handleDeleteTask = () => {
    handleCloseMenu();
    dispatch(taskActions.deleteTask(deleteTaskId));
  };

  const handleOpenTask = (task: Task) => () => setSelectedTask(task);

  const handleCloseTask = () => setSelectedTask(null);

  const handleOpenMenu = (taskId: number) => (event?: React.MouseEvent<HTMLButtonElement>) => {
    setDeleteTaskId(taskId);
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchor(null);

  const getSeverityElement = (severity: string) => {
    switch (severity) {
      case SEVERITY.LOW:
        return <KeyboardArrowDownOutlinedIcon color="info" />;
      case SEVERITY.HIGH:
        return <KeyboardControlKeyOutlinedIcon color="warning" />;
      case SEVERITY.CRITICAL:
        return <KeyboardDoubleArrowUpOutlinedIcon color="error" />;
      default:
        return <DragHandleIcon color="primary" />;
    }
  };

  const getTaskStatus = (status: string) => {
    switch (status) {
      case TASK_STATUS.DONE:
        return 'success';
      case TASK_STATUS.PROGRESS:
        return 'warning';
      default:
        return 'primary';
    }
  };

  const handleSearchTask: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearch(event.target.value);
  };

  const renderTaskList = () => {
    if (!tasks.length && !isLoading) {
      return <Box sx={styles.emptyRecordStyles}>no records</Box>;
    } else if (!tasks.length) {
      return (
        <Box>
          {new Array(10).fill(0).map((_: number, index: number) => (
            <Box className="flex mx-3 my-2" key={index}>
              <Skeleton variant="circular" height={40} width={40} className="mr-2" />
              <Skeleton variant="rectangular" height={40} sx={styles.skeletonStyles} />
            </Box>
          ))}
        </Box>
      );
    }
    const getListItemContent = (task: Task) => {
      const categoryValue = taskCategories.find((category: Category) => category.id === task.categoryId)?.value;
      return (
        <>
          <Radio
            onClick={handleCompleteTask(task)}
            checked={task?.status === TASK_STATUS.DONE}
            sx={styles.buttonStyles}
            disabled={isLoading}
          />
          <ListItemButton disableRipple disabled={isLoading} sx={styles.buttonStyles} onClick={handleOpenTask(task)}>
            <Box sx={styles.typographyStyles} className="flex items-center">
              {task?.categoryId && (
                <Chip
                  size="small"
                  variant="outlined"
                  className="mr-2"
                  label={categoryValue?.toLowerCase()}
                />
              )}
              <Typography noWrap>{task.title}</Typography>
            </Box>
            <Box className="flex mr-12">
              <Box sx={styles.labelStyles}>Status:</Box>
              <Chip
                size="small"
                label={task?.status.toLowerCase()}
                sx={styles.chipStyles}
                color={getTaskStatus(task.status)}
              />
            </Box>
            <Box className="flex mr-12">
              <Box sx={styles.labelStyles}>Severity:</Box>
              {getSeverityElement(task.severity)}
            </Box>
          </ListItemButton>
        </>
      );
    };
    return (
      <List dense>
        {tasks.map((task, index) => {
          if (index + 1 === tasks.length) { // Last item
            return (
              <ListItem
                sx={styles.listItemStyles}
                disablePadding
                ref={lastItemObserver}
                key={task.id}
                secondaryAction={
                  <IconButton sx={styles.buttonStyles} onClick={handleOpenMenu(task.id)} disabled={isLoading}>
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                {getListItemContent(task)}
              </ListItem>
            );
          }
          return (
            <ListItem
              sx={styles.listItemStyles}
              disablePadding
              key={task.id}
              secondaryAction={
                <IconButton sx={styles.buttonStyles} onClick={handleOpenMenu(task.id)} disabled={isLoading}>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              {getListItemContent(task)}
            </ListItem>
          );
        })}
      </List>
    );
  };

  const handleChangeFilterSelect =
    (field: string) =>
      ({ value }: DefaultObjectType) => {
        if (value === 'ALL') {
        // Remove Filter in case all filters
          const removedStatusFilter = omit(taskFilter, [field]);
          dispatch(taskActions.setTaskParams({ filter: removedStatusFilter }));
        } else {
          dispatch(
            taskActions.setTaskParams({
              filter: {
                ...taskFilter,
                [field]: value
              }
            })
          );
        }
      };

  const handleChangeOrderValue = () => {
    const value = isAscending ? SORT_TYPE.DESCENDING : SORT_TYPE.ASCENDING;
    dispatch(taskActions.setTaskParams({ sorter: { ...taskSorter, value } }));
  };

  const handleChangeOrderSelect = ({ value: field }: { value: SORT_TYPE }) => {
    dispatch(taskActions.setTaskParams({ sorter: { ...taskSorter, field } }));
  };

  useEffect(() => {
    if (loading === LOADING_STATE.FAIL) {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  }, [loading]);

  useEffect(() => {
    // Remove search filter first in debounce doesn't contain value
    let newFilter: Partial<TaskFilter> = omit(taskFilter, ['search']);
    if (debounceSearch) {
      newFilter = {
        ...taskFilter,
        search: debounceSearch
      };
    }
    dispatch(taskActions.setTaskParams({ filter: newFilter }));
  }, [debounceSearch]);

  useEffect(() => {
    const { currentPage, lastPage } = taskPaginator;
    if (currentPage <= lastPage && loading === LOADING_STATE.IDLE) {
      dispatch(taskActions.fetchTasks(taskParams));
    }
  }, [taskFilter, taskSorter, taskPaginator.currentPage]);

  useEffect(() => {
    if (!taskCategories.length) {
      dispatch(taskActions.fetchTaskCategories());
    }
  }, []);

  // Handle Deeplinking
  // useEffect(() => {
  //   const { id } = params;
  //   if (id) {
  //     const deepLinkingTask: Task = tasks.find((task: Task) => task.id === Number(id));
  //     if (deepLinkingTask) {
  //       setSelectedTask(deepLinkingTask);
  //     }
  //     const cleanUrl = location.pathname.substring(0, location.pathname.length - 2);
  //     navigate(cleanUrl, { replace: true });
  //   }
  // }, [tasks.length]);

  return (
    <PageContainer title="Tasks" loading={isLoading} routes={adminRoutes}>
      <Grid sx={styles.toolbarStyles} rowSpacing={{ xs: 1, sm: 1, md: 1, lg: 0 }} columnSpacing={1}>
        <Grid item xs={12} lg={4}>
          <Box className="mr-4 mb-2 flex-shrink-0">
            <Input
              autoComplete="off"
              type="search"
              disabled={isLoading}
              placeholder="Search task"
              icon={<SearchOutlinedIcon />}
              value={search}
              onChange={handleSearchTask}
            />
          </Box>
        </Grid>
        <Grid item xs={12} lg={8} className="flex items-center flex-wrap">
          <Box className="mr-4 mb-2 flex-shrink-0">Filter by:</Box>
          <Box className="mr-4 mb-2 flex-shrink-0">
            <BaseSelect
              name="status"
              options={TaskStatusOptions}
              defaultValue={TaskStatusOptions[0]}
              disabled={isLoading}
              styles={styles.selectStyles}
              onChange={handleChangeFilterSelect('status')}
            />
          </Box>
          <Box className="mr-4 mb-2 flex-shrink-0">
            <BaseSelect
              name="severity"
              options={TaskSeverityOptions}
              defaultValue={TaskSeverityOptions[0]}
              disabled={isLoading}
              styles={styles.selectStyles}
              onChange={handleChangeFilterSelect('severity')}
            />
          </Box>
          <Box className="mr-4 mb-2 flex-shrink-0">Order by</Box>
          <Box className="mr-4 mb-2 flex-shrink-0 flex items-center">
            <BaseSelect
              name="order"
              options={TaskSortByOptions}
              defaultValue={TaskSortByOptions[0]}
              disabled={isLoading}
              value={taskSortOption}
              styles={styles.selectStyles}
              onChange={handleChangeOrderSelect}
            />
            <IconButton size="small" sx={{ ml: 1 }} onClick={handleChangeOrderValue} aria-labelledby="order by button">
              {isAscending ? <NorthOutlinedIcon fontSize="small" /> : <SouthOutlinedIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Box sx={styles.listContainerStyles}>
        <Box sx={styles.quickSearchStyles}>
          <form onSubmit={handleSubmit(handleCreateTask)} className="flex items-center flex-wrap">
            <FormInput
              name="title"
              autoComplete="off"
              className="border-0 border-radius-4 w-100"
              placeholder="Quick Create Task"
              sx={{ height: '2.5rem' }}
              control={control}
              disabled={isLoading}
            />
          </form>
        </Box>
        {renderTaskList()}
      </Box>
      {selectedTask && <TaskForm open={!!selectedTask} task={selectedTask} onClose={handleCloseTask} />}
      {deleteTaskId && (
        <Menu anchorEl={menuAnchor} open={openMenu} onClose={handleCloseMenu}>
          <MenuItem className="flex items-center" onClick={handleDeleteTask}>
            <DeleteOutlineIcon fontSize="small" className="mr-3" />
            Delete
          </MenuItem>
        </Menu>
      )}
    </PageContainer>
  );
};

export default Tasks;
