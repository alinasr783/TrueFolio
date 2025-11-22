import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  FolderKanban,
  LayoutGrid,
  List
} from 'lucide-react';

const Button = ({ children, className, variant = 'default', size = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary'
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
    {...props}
  />
);

const Card = ({ children, className }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>
    {children}
  </p>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

const Badge = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground'
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

const Avatar = ({ children, className }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt }) => (
  <img src={src} alt={alt} className="aspect-square h-full w-full" />
);

const AvatarFallback = ({ children, className }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className || ''}`}>
    {children}
  </div>
);

const Progress = ({ value, className }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className || ''}`}>
    <div 
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;

const DropdownMenuTrigger = ({ children, asChild, ...props }) => (
  <button {...props}>{children}</button>
);

const DropdownMenuContent = ({ children, align = 'start', className }) => (
  <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ''}`}>
    {children}
  </div>
);

const DropdownMenuLabel = ({ children, className }) => (
  <div className={`px-2 py-1.5 text-sm font-semibold ${className || ''}`}>
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className }) => (
  <div className={`-mx-1 my-1 h-px bg-muted ${className || ''}`} />
);

const DropdownMenuItem = ({ children, className, ...props }) => (
  <button 
    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          open, 
          setOpen, 
          selectedValue: value,
          onSelect: onValueChange
        })
      )}
    </div>
  );
};

const SelectTrigger = ({ children, className, open, setOpen, selectedValue }) => (
  <button 
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
    onClick={() => setOpen(!open)}
  >
    <span>{selectedValue || children}</span>
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="h-4 w-4 opacity-50">
      <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 9.10753 10.2439 9.39245 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor"></path>
    </svg>
  </button>
);

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;

const SelectContent = ({ children, open, onSelect }) => {
  if (!open) return null;

  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-full">
      {React.Children.map(children, child =>
        React.cloneElement(child, { onSelect })
      )}
    </div>
  );
};

const SelectItem = ({ children, value, onSelect }) => (
  <button 
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
    onClick={() => onSelect(value)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      ✓
    </span>
    {children}
  </button>
);

// ... البيانات والمكون الرئيسي
const ProjectsManagementPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern UI/UX',
      status: 'active',
      priority: 'high',
      progress: 65,
      dueDate: '2024-02-15',
      team: [
        { id: '1', name: 'Alice Johnson', initials: 'AJ', avatar: '' },
        { id: '2', name: 'Bob Smith', initials: 'BS', avatar: '' },
        { id: '3', name: 'Carol White', initials: 'CW', avatar: '' },
      ],
      tasksCompleted: 13,
      totalTasks: 20,
      category: 'Design',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native iOS and Android app for customer engagement',
      status: 'active',
      priority: 'high',
      progress: 45,
      dueDate: '2024-03-20',
      team: [
        { id: '4', name: 'David Lee', initials: 'DL', avatar: '' },
        { id: '5', name: 'Emma Davis', initials: 'ED', avatar: '' },
      ],
      tasksCompleted: 9,
      totalTasks: 20,
      category: 'Development',
    },
    {
      id: '3',
      name: 'Marketing Campaign Q1',
      description: 'Launch new product marketing campaign across all channels',
      status: 'planning',
      priority: 'medium',
      progress: 20,
      dueDate: '2024-01-30',
      team: [
        { id: '6', name: 'Frank Miller', initials: 'FM', avatar: '' },
        { id: '7', name: 'Grace Taylor', initials: 'GT', avatar: '' },
        { id: '8', name: 'Henry Wilson', initials: 'HW', avatar: '' },
      ],
      tasksCompleted: 3,
      totalTasks: 15,
      category: 'Marketing',
    },
    {
      id: '4',
      name: 'Database Migration',
      description: 'Migrate legacy database to cloud infrastructure',
      status: 'completed',
      priority: 'high',
      progress: 100,
      dueDate: '2024-01-10',
      team: [
        { id: '9', name: 'Ivy Chen', initials: 'IC', avatar: '' },
        { id: '10', name: 'Jack Brown', initials: 'JB', avatar: '' },
      ],
      tasksCompleted: 12,
      totalTasks: 12,
      category: 'Infrastructure',
    },
    {
      id: '5',
      name: 'Customer Portal',
      description: 'Self-service portal for customer account management',
      status: 'on-hold',
      priority: 'low',
      progress: 30,
      dueDate: '2024-04-15',
      team: [
        { id: '11', name: 'Kate Anderson', initials: 'KA', avatar: '' },
      ],
      tasksCompleted: 6,
      totalTasks: 20,
      category: 'Development',
    },
    {
      id: '6',
      name: 'API Integration',
      description: 'Integrate third-party payment and analytics APIs',
      status: 'active',
      priority: 'medium',
      progress: 55,
      dueDate: '2024-02-28',
      team: [
        { id: '12', name: 'Liam Martinez', initials: 'LM', avatar: '' },
        { id: '13', name: 'Mia Garcia', initials: 'MG', avatar: '' },
      ],
      tasksCompleted: 11,
      totalTasks: 20,
      category: 'Development',
    },
  ];

  const stats = [
    {
      title: 'Total Projects',
      value: '24',
      change: '+12%',
      icon: FolderKanban,
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+5%',
      icon: TrendingUp,
      trend: 'up',
    },
    {
      title: 'Completed',
      value: '8',
      change: '+20%',
      icon: CheckCircle2,
      trend: 'up',
    },
    {
      title: 'On Hold',
      value: '4',
      change: '-8%',
      icon: Clock,
      trend: 'down',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'on-hold':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'planning':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your projects in one place
            </p>
          </div>
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {project.tasksCompleted}/{project.totalTasks} tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{project.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                          <Badge variant="secondary">{project.category}</Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              {project.tasksCompleted}/{project.totalTasks}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{project.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{project.team.length} members</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <div className="w-32">
                            <Progress value={project.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectsManagementPage;