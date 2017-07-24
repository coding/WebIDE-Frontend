export default {
  cancel: 'Cancel',
  commit: 'Commit',
  branchWidget: {
    branches: 'Git Branches',
    fetchingBranches: 'Fetching Branches...',
    checkout: 'Checkout',
    checkoutAsNew: 'Checkout as new branch',
    delete: 'Delete',
    newBranch: 'New Branches',
    synchronize: 'Synchronize',
    localBranches: 'Local Branches',
    remoteBranches: 'Remote Branches'
  },
  commitView: {
    nothingCommit: 'Your working directory is clean. Nothing to commit.'
  },
  fileTree: {
    fileStatus: 'File Status',
    changed: 'Changed',
    staged: 'Staged'
  },
  historyView: {
    compare: 'Compare',
    compareWithLocal: 'Compare with Local',
    listChanges: 'Show All Effected Files',
    copyRevision: 'Copy Revision Number',
    version: 'Version',
    date: 'Date',
    author: 'Author',
    message: 'Message',
    showCommit: 'Show Commit'
  },
  checkoutModal: {
    checkoutAsNew: 'Checkout New Branch',
    fromBranch: 'From Branch',
    newBranch: 'New Branch',
    refExistStatus: 'Branch ref already exists. Pick another name.'
  },
  checkoutStashModal: {
    checkoutFailed: 'Checkout failed',
    checkoutConfilcts: 'Checkout has not completed because of checkout conflicts, do you want to stash first?',
    stashAndCheckout: 'Stash and Checkout'
  },
  resolveConflictModal: {
    noConflictMessege: 'No conflict detected',
    title: 'Conflicts List'
  },
  diffFileModal: {
    title: 'Diff File: {path}',
    titleWithOldRef: 'Diff File: {path} - {newRef} vs {oldRef}'
  },
  mergeModal: {
    title: 'Merge Branch',
    currentBranch: 'Current Branch',
    destBranch: 'Branch to merge',
    selectBranch: 'select a branch'
  },
  mergeFile: {
    title: 'Merge File',
    local: 'LOCAL',
    remote: 'REMOTE',
    base: 'BASE'
  },
  newBranchModal: {
    titel: 'Create New Branch',
    current: 'Current Branch',
    newBranch: 'New Branch',
    confirmMessage: 'Branch ref already exists. Pick another name.'
  },
  rebasePrepare: {
    title: 'Rebase Commits',
    editRebase: '编辑提交',
    view: 'View',
    up: 'Up',
    down: 'Down'
  },
  rebaseStart: {
    title: 'Rebase Branch',
    branch: 'Branch',
    interactive: 'Interactive',
    preserveMerge: 'Preserve Merges',
    onto: 'Onto',
    validate: 'Validate',
    showTags: 'Show Tags',
    showRemoteTags: 'Show Remote Branches',
    selectBranch: 'select a branch'

  },
  reset: {
    title: 'Reset Head',
    type: 'Reset Type',
    toCommit: '指定提交',
    currentBranch: 'Current Branch',
  },
  stash: {
    title: 'Stash Changes',
    currentBranch: 'Current Branch',
    commitMessage: 'Commit Message',
    placeholder: 'Please input a commit message.'
  },
  tag: {
    title: 'Tag',
    currentBranch: 'Current Branch',
    tagName: 'Tag Name',
    commit: 'Commit',
    message: 'Message',
    force: 'Force',
    optional: 'optional',
    errMsg: 'The tag with the same name exists.'

  },
  unStash: {
    title: 'Unstash Changes',
    currentBranch: 'Current Branch',
    stashes: 'Stashes',
    view: 'View',
    drop: 'Drop',
    clear: 'Clear',
    popStash: 'Pop stash',
    reinstateIndex: 'Reinstate index',
    asNewBranch: 'As new branch',
    placeholder: 'Please input the branch name.',
    apply: 'Apply',
    branch: 'Branch'

  },
  action: {
    commitSuccess: 'Git commit success.',
    fetchSuccess: 'Get Fetch Success',
    checkoutBranch: 'Check out {branch}',
    checkoutConflictsWarning: 'Checkout has not completed because of checkout conflicts',
    checkoutFailed: 'Checkout failed',
    checkoutFailedWithoutDeleted: 'Checkout has completed, but some files could not be deleted',
    checkoutNotDeleted: 'Nondeleted Files',
    checkoutFailedError: 'An Exception occurred during checkout, status: {status}',
    deletedSuccess: 'deleted branch {branch} success'
  }
}
