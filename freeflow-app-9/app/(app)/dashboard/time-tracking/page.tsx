"use client";"


  useEffect(() => {
    setEntries(mockEntries);
  }, []);

  const startTimer = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId: 'current',
      projectName: 'Current Project',
      taskName: 'New Task',
      startTime: new Date(),
      duration: 0,
      billable: true
    };
    
    setCurrentEntry(newEntry);
    setIsTracking(true);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    if (currentEntry) {
      const updatedEntry = {
        ...currentEntry,
        endTime: new Date(),
        duration: Math.floor(elapsedTime / 60)
      };
      
      setEntries(prev => [...prev, updatedEntry]);
      setCurrentEntry(null);
    }
    
    setIsTracking(false);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;'
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateEarnings = (duration: number, rate: number = 75) => {
    return ((duration / 60) * rate).toFixed(2);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
  const totalEarnings = entries.reduce((sum, entry) => 
    sum + (entry.billable ? (entry.duration / 60) * (entry.hourlyRate || 75) : 0), 0
  );

  return (
    <div className= "max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h1 className= "text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className= "text-gray-600 mt-1">Track your time and manage billable hours</p>
        </div>
        <div className= "flex gap-3">
          <Button variant= "outline" className= "gap-2" data-testid= "export-timesheet-btn">
            <Calendar className= "h-4 w-4" />
            Export Timesheet
          </Button>
          <Button className= "gap-2" data-testid= "add-manual-entry-btn">
            <Plus className= "h-4 w-4" />
            Add Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className= "grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className= "h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
                <p className= "text-sm text-gray-500">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className= "h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">$${totalEarnings.toFixed(2)}</p>
                <p className= "text-sm text-gray-500">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className= "h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">{entries.length}</p>
                <p className= "text-sm text-gray-500">Time Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className= "h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">$75</p>
                <p className= "text-sm text-gray-500">Avg. Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className= "flex items-center gap-2">
            <Timer className= "h-5 w-5" />
            Current Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className= "flex items-center justify-between">
            <div className= "flex items-center gap-4">
              <div className= "text-4xl font-mono font-bold text-gray-900">
                {formatTime(elapsedTime)}
              </div>
              {currentEntry && (
                <div>
                  <p className= "font-medium">{currentEntry.taskName}</p>
                  <p className= "text-sm text-gray-600">{currentEntry.projectName}</p>
                </div>
              )}
            </div>
            
            <div className= "flex gap-2">
              {!isTracking ? (
                <Button
                  onClick={startTimer}
                  className= "gap-2 bg-green-600 hover:bg-green-700"
                  data-testid= "start-timer-btn"
                >
                  <Play className= "h-4 w-4" />
                  Start Timer
                </Button>
              ) : (
                <>
                  <Button
                    variant= "outline"
                    className= "gap-2"
                    data-testid= "pause-timer-btn"
                  >
                    <Pause className= "h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    onClick={stopTimer}
                    variant= "destructive"
                    className= "gap-2"
                    data-testid= "stop-timer-btn"
                  >
                    <Square className= "h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className= "space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className= "flex items-center justify-between p-4 border rounded-lg">
                <div className= "flex-1">
                  <div className= "flex items-center gap-2">
                    <h4 className= "font-medium">{entry.taskName}</h4>
                    <Badge variant= "outline">{entry.projectName}</Badge>
                    {entry.billable && (
                      <Badge className= "bg-green-100 text-green-800">Billable</Badge>
                    )}
                  </div>
                  <p className= "text-sm text-gray-600 mt-1">
                    {entry.startTime.toLocaleTimeString()} - {entry.endTime?.toLocaleTimeString()}
                  </p>
                </div>
                
                <div className= "flex items-center gap-4">
                  <div className= "text-right">
                    <p className= "font-medium">{formatDuration(entry.duration)}</p>
                    {entry.billable && entry.hourlyRate && (
                      <p className= "text-sm text-gray-600">
                        $${calculateEarnings(entry.duration, entry.hourlyRate)}
                      </p>
                    )}
                  </div>
                  
                  <div className= "flex gap-1">
                    <Button variant= "ghost" size= "sm" data-testid= "edit-entry-btn">
                      <Edit className= "h-4 w-4" />
                    </Button>
                    <Button variant= "ghost" size= "sm" data-testid= "delete-entry-btn">
                      <Trash2 className= "h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}