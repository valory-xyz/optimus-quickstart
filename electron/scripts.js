const BrewScript = "# We don't need return codes for \"$(command)\", only stdout is needed.\n" +
"# Allow `[[ -n \"$(command)\" ]]`, `func \"$(command)\"`, pipes, etc.\n" +
"# shellcheck disable=SC2312\n" +
"\n" +
"set -u\n" +
"\n" +
"abort() {\n" +
"  printf \"%s\n" +
"\" \"$@\" >&2\n" +
"  exit 1\n" +
"}\n" +
"\n" +
"# Fail fast with a concise message when not using bash\n" +
"# Single brackets are needed here for POSIX compatibility\n" +
"# shellcheck disable=SC2292\n" +
"if [ -z \"${BASH_VERSION:-}\" ]\n" +
"then\n" +
"  abort \"Bash is required to interpret this script.\"\n" +
"fi\n" +
"\n" +
"# Check if script is run with force-interactive mode in CI\n" +
"if [[ -n \"${CI-}\" && -n \"${INTERACTIVE-}\" ]]\n" +
"then\n" +
"  abort \"Cannot run force-interactive mode in CI.\"\n" +
"fi\n" +
"\n" +
"# Check if both `INTERACTIVE` and `NONINTERACTIVE` are set\n" +
"# Always use single-quoted strings with `exp` expressions\n" +
"# shellcheck disable=SC2016\n" +
"if [[ -n \"${INTERACTIVE-}\" && -n \"${NONINTERACTIVE-}\" ]]\n" +
"then\n" +
"  abort 'Both `$INTERACTIVE` and `$NONINTERACTIVE` are set. Please unset at least one variable and try again.'\n" +
"fi\n" +
"\n" +
"# Check if script is run in POSIX mode\n" +
"if [[ -n \"${POSIXLY_CORRECT+1}\" ]]\n" +
"then\n" +
"  abort 'Bash must not run in POSIX mode. Please unset POSIXLY_CORRECT and try again.'\n" +
"fi\n" +
"\n" +
"usage() {\n" +
"  cat <<EOS\n" +
"Homebrew Installer\n" +
"Usage: [NONINTERACTIVE=1] [CI=1] install.sh [options]\n" +
"    -h, --help       Display this message.\n" +
"    NONINTERACTIVE   Install without prompting for user input\n" +
"    CI               Install in CI mode (e.g. do not prompt for user input)\n" +
"EOS\n" +
"  exit \"${1:-0}\"\n" +
"}\n" +
"\n" +
"while [[ $# -gt 0 ]]\n" +
"do\n" +
"  case \"$1\" in\n" +
"    -h | --help) usage ;;\n" +
"    *)\n" +
"      warn \"Unrecognized option: '$1'\"\n" +
"      usage 1\n" +
"      ;;\n" +
"  esac\n" +
"done\n" +
"\n" +
"# string formatters\n" +
"if [[ -t 1 ]]\n" +
"then\n" +
"  tty_escape() { printf \"[%sm\" \"$1\"; }\n" +
"else\n" +
"  tty_escape() { :; }\n" +
"fi\n" +
"tty_mkbold() { tty_escape \"1;$1\"; }\n" +
"tty_underline=\"$(tty_escape \"4;39\")\"\n" +
"tty_blue=\"$(tty_mkbold 34)\"\n" +
"tty_red=\"$(tty_mkbold 31)\"\n" +
"tty_bold=\"$(tty_mkbold 39)\"\n" +
"tty_reset=\"$(tty_escape 0)\"\n" +
"\n" +
"shell_join() {\n" +
"  local arg\n" +
"  printf \"%s\" \"$1\"\n" +
"  shift\n" +
"  for arg in \"$@\"\n" +
"  do\n" +
"    printf \" \"\n" +
"    printf \"%s\" \"${arg// /\ }\"\n" +
"  done\n" +
"}\n" +
"\n" +
"chomp() {\n" +
"  printf \"%s\" \"${1/\"$'\n" +
"'\"/}\"\n" +
"}\n" +
"\n" +
"ohai() {\n" +
"  printf \"${tty_blue}==>${tty_bold} %s${tty_reset}\n" +
"\" \"$(shell_join \"$@\")\"\n" +
"}\n" +
"\n" +
"warn() {\n" +
"  printf \"${tty_red}Warning${tty_reset}: %s\n" +
"\" \"$(chomp \"$1\")\" >&2\n" +
"}\n" +
"\n" +
"# Check if script is run non-interactively (e.g. CI)\n" +
"# If it is run non-interactively we should not prompt for passwords.\n" +
"# Always use single-quoted strings with `exp` expressions\n" +
"# shellcheck disable=SC2016\n" +
"if [[ -z \"${NONINTERACTIVE-}\" ]]\n" +
"then\n" +
"  if [[ -n \"${CI-}\" ]]\n" +
"  then\n" +
"    warn 'Running in non-interactive mode because `$CI` is set.'\n" +
"    NONINTERACTIVE=1\n" +
"  elif [[ ! -t 0 ]]\n" +
"  then\n" +
"    if [[ -z \"${INTERACTIVE-}\" ]]\n" +
"    then\n" +
"      warn 'Running in non-interactive mode because `stdin` is not a TTY.'\n" +
"      NONINTERACTIVE=1\n" +
"    else\n" +
"      warn 'Running in interactive mode despite `stdin` not being a TTY because `$INTERACTIVE` is set.'\n" +
"    fi\n" +
"  fi\n" +
"else\n" +
"  ohai 'Running in non-interactive mode because `$NONINTERACTIVE` is set.'\n" +
"fi\n" +
"\n" +
"# USER isn't always set so provide a fall back for the installer and subprocesses.\n" +
"if [[ -z \"${USER-}\" ]]\n" +
"then\n" +
"  USER=\"$(chomp \"$(id -un)\")\"\n" +
"  export USER\n" +
"fi\n" +
"\n" +
"# First check OS.\n" +
"OS=\"$(uname)\"\n" +
"if [[ \"${OS}\" == \"Linux\" ]]\n" +
"then\n" +
"  HOMEBREW_ON_LINUX=1\n" +
"elif [[ \"${OS}\" == \"Darwin\" ]]\n" +
"then\n" +
"  HOMEBREW_ON_MACOS=1\n" +
"else\n" +
"  abort \"Homebrew is only supported on macOS and Linux.\"\n" +
"fi\n" +
"\n" +
"# Required installation paths. To install elsewhere (which is unsupported)\n" +
"# you can untar https://github.com/Homebrew/brew/tarball/master\n" +
"# anywhere you like.\n" +
"if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]]\n" +
"then\n" +
"  UNAME_MACHINE=\"$(/usr/bin/uname -m)\"\n" +
"\n" +
"  if [[ \"${UNAME_MACHINE}\" == \"arm64\" ]]\n" +
"  then\n" +
"    # On ARM macOS, this script installs to /opt/homebrew only\n" +
"    HOMEBREW_PREFIX=\"/opt/homebrew\"\n" +
"    HOMEBREW_REPOSITORY=\"${HOMEBREW_PREFIX}\"\n" +
"  else\n" +
"    # On Intel macOS, this script installs to /usr/local only\n" +
"    HOMEBREW_PREFIX=\"/usr/local\"\n" +
"    HOMEBREW_REPOSITORY=\"${HOMEBREW_PREFIX}/Homebrew\"\n" +
"  fi\n" +
"  HOMEBREW_CACHE=\"${HOME}/Library/Caches/Homebrew\"\n" +
"\n" +
"  STAT_PRINTF=(\"/usr/bin/stat\" \"-f\")\n" +
"  PERMISSION_FORMAT=\"%A\"\n" +
"  CHOWN=(\"/usr/sbin/chown\")\n" +
"  CHGRP=(\"/usr/bin/chgrp\")\n" +
"  GROUP=\"admin\"\n" +
"  TOUCH=(\"/usr/bin/touch\")\n" +
"  INSTALL=(\"/usr/bin/install\" -d -o \"root\" -g \"wheel\" -m \"0755\")\n" +
"else\n" +
"  UNAME_MACHINE=\"$(uname -m)\"\n" +
"\n" +
"  # On Linux, this script installs to /home/linuxbrew/.linuxbrew only\n" +
"  HOMEBREW_PREFIX=\"/home/linuxbrew/.linuxbrew\"\n" +
"  HOMEBREW_REPOSITORY=\"${HOMEBREW_PREFIX}/Homebrew\"\n" +
"  HOMEBREW_CACHE=\"${HOME}/.cache/Homebrew\"\n" +
"\n" +
"  STAT_PRINTF=(\"/usr/bin/stat\" \"--printf\")\n" +
"  PERMISSION_FORMAT=\"%a\"\n" +
"  CHOWN=(\"/bin/chown\")\n" +
"  CHGRP=(\"/bin/chgrp\")\n" +
"  GROUP=\"$(id -gn)\"\n" +
"  TOUCH=(\"/bin/touch\")\n" +
"  INSTALL=(\"/usr/bin/install\" -d -o \"${USER}\" -g \"${GROUP}\" -m \"0755\")\n" +
"fi\n" +
"CHMOD=(\"/bin/chmod\")\n" +
"MKDIR=(\"/bin/mkdir\" \"-p\")\n" +
"HOMEBREW_BREW_DEFAULT_GIT_REMOTE=\"https://github.com/Homebrew/brew\"\n" +
"HOMEBREW_CORE_DEFAULT_GIT_REMOTE=\"https://github.com/Homebrew/homebrew-core\"\n" +
"\n" +
"# Use remote URLs of Homebrew repositories from environment if set.\n" +
"HOMEBREW_BREW_GIT_REMOTE=\"${HOMEBREW_BREW_GIT_REMOTE:-\"${HOMEBREW_BREW_DEFAULT_GIT_REMOTE}\"}\"\n" +
"HOMEBREW_CORE_GIT_REMOTE=\"${HOMEBREW_CORE_GIT_REMOTE:-\"${HOMEBREW_CORE_DEFAULT_GIT_REMOTE}\"}\"\n" +
"# The URLs with and without the '.git' suffix are the same Git remote. Do not prompt.\n" +
"if [[ \"${HOMEBREW_BREW_GIT_REMOTE}\" == \"${HOMEBREW_BREW_DEFAULT_GIT_REMOTE}.git\" ]]\n" +
"then\n" +
"  HOMEBREW_BREW_GIT_REMOTE=\"${HOMEBREW_BREW_DEFAULT_GIT_REMOTE}\"\n" +
"fi\n" +
"if [[ \"${HOMEBREW_CORE_GIT_REMOTE}\" == \"${HOMEBREW_CORE_DEFAULT_GIT_REMOTE}.git\" ]]\n" +
"then\n" +
"  HOMEBREW_CORE_GIT_REMOTE=\"${HOMEBREW_CORE_DEFAULT_GIT_REMOTE}\"\n" +
"fi\n" +
"export HOMEBREW_{BREW,CORE}_GIT_REMOTE\n" +
"\n" +
"# TODO: bump version when new macOS is released or announced\n" +
"MACOS_NEWEST_UNSUPPORTED=\"15.0\"\n" +
"# TODO: bump version when new macOS is released\n" +
"MACOS_OLDEST_SUPPORTED=\"12.0\"\n" +
"\n" +
"# For Homebrew on Linux\n" +
"REQUIRED_RUBY_VERSION=2.6    # https://github.com/Homebrew/brew/pull/6556\n" +
"REQUIRED_GLIBC_VERSION=2.13  # https://docs.brew.sh/Homebrew-on-Linux#requirements\n" +
"REQUIRED_CURL_VERSION=7.41.0 # HOMEBREW_MINIMUM_CURL_VERSION in brew.sh in Homebrew/brew\n" +
"REQUIRED_GIT_VERSION=2.7.0   # HOMEBREW_MINIMUM_GIT_VERSION in brew.sh in Homebrew/brew\n" +
"\n" +
"# no analytics during installation\n" +
"export HOMEBREW_NO_ANALYTICS_THIS_RUN=1\n" +
"export HOMEBREW_NO_ANALYTICS_MESSAGE_OUTPUT=1\n" +
"\n" +
"unset HAVE_SUDO_ACCESS # unset this from the environment\n" +
"\n" +
"have_sudo_access() {\n" +
"  if [[ ! -x \"/usr/bin/sudo\" ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  local -a SUDO=(\"/usr/bin/sudo\")\n" +
"  if [[ -n \"${SUDO_ASKPASS-}\" ]]\n" +
"  then\n" +
"    SUDO+=(\"-A\")\n" +
"  elif [[ -n \"${NONINTERACTIVE-}\" ]]\n" +
"  then\n" +
"    SUDO+=(\"-n\")\n" +
"  fi\n" +
"\n" +
"  if [[ -z \"${HAVE_SUDO_ACCESS-}\" ]]\n" +
"  then\n" +
"    if [[ -n \"${NONINTERACTIVE-}\" ]]\n" +
"    then\n" +
"      \"${SUDO[@]}\" -l mkdir &>/dev/null\n" +
"    else\n" +
"      \"${SUDO[@]}\" -v && \"${SUDO[@]}\" -l mkdir &>/dev/null\n" +
"    fi\n" +
"    HAVE_SUDO_ACCESS=\"$?\"\n" +
"  fi\n" +
"\n" +
"  if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]] && [[ \"${HAVE_SUDO_ACCESS}\" -ne 0 ]]\n" +
"  then\n" +
"    abort \"Need sudo access on macOS (e.g. the user ${USER} needs to be an Administrator)!\"\n" +
"  fi\n" +
"\n" +
"  return \"${HAVE_SUDO_ACCESS}\"\n" +
"}\n" +
"\n" +
"execute() {\n" +
"  if ! \"$@\"\n" +
"  then\n" +
"    abort \"$(printf \"Failed during: %s\" \"$(shell_join \"$@\")\")\"\n" +
"  fi\n" +
"}\n" +
"\n" +
"execute_sudo() {\n" +
"  local -a args=(\"$@\")\n" +
"  if [[ \"${EUID:-${UID}}\" != \"0\" ]] && have_sudo_access\n" +
"  then\n" +
"    if [[ -n \"${SUDO_ASKPASS-}\" ]]\n" +
"    then\n" +
"      args=(\"-A\" \"${args[@]}\")\n" +
"    fi\n" +
"    ohai \"/usr/bin/sudo\" \"${args[@]}\"\n" +
"    execute \"/usr/bin/sudo\" \"${args[@]}\"\n" +
"  else\n" +
"    ohai \"${args[@]}\"\n" +
"    execute \"${args[@]}\"\n" +
"  fi\n" +
"}\n" +
"\n" +
"getc() {\n" +
"  local save_state\n" +
"  save_state=\"$(/bin/stty -g)\"\n" +
"  /bin/stty raw -echo\n" +
"  IFS='' read -r -n 1 -d '' \"$@\"\n" +
"  /bin/stty \"${save_state}\"\n" +
"}\n" +
"\n" +
"ring_bell() {\n" +
"  # Use the shell's audible bell.\n" +
"  if [[ -t 1 ]]\n" +
"  then\n" +
"    printf \"\"\n" +
"  fi\n" +
"}\n" +
"\n" +
"wait_for_user() {\n" +
"  local c\n" +
"  echo\n" +
"  echo \"Press ${tty_bold}RETURN${tty_reset}/${tty_bold}ENTER${tty_reset} to continue or any other key to abort:\"\n" +
"  getc c\n" +
"  # we test for \n" +
" and \n" +
" because some stuff does \n" +
" instead\n" +
"  if ! [[ \"${c}\" == $'\n" +
"' || \"${c}\" == $'\n" +
"' ]]\n" +
"  then\n" +
"    exit 1\n" +
"  fi\n" +
"}\n" +
"\n" +
"major_minor() {\n" +
"  echo \"${1%%.*}.$(\n" +
"    x=\"${1#*.}\"\n" +
"    echo \"${x%%.*}\"\n" +
"  )\"\n" +
"}\n" +
"\n" +
"version_gt() {\n" +
"  [[ \"${1%.*}\" -gt \"${2%.*}\" ]] || [[ \"${1%.*}\" -eq \"${2%.*}\" && \"${1#*.}\" -gt \"${2#*.}\" ]]\n" +
"}\n" +
"version_ge() {\n" +
"  [[ \"${1%.*}\" -gt \"${2%.*}\" ]] || [[ \"${1%.*}\" -eq \"${2%.*}\" && \"${1#*.}\" -ge \"${2#*.}\" ]]\n" +
"}\n" +
"version_lt() {\n" +
"  [[ \"${1%.*}\" -lt \"${2%.*}\" ]] || [[ \"${1%.*}\" -eq \"${2%.*}\" && \"${1#*.}\" -lt \"${2#*.}\" ]]\n" +
"}\n" +
"\n" +
"check_run_command_as_root() {\n" +
"  [[ \"${EUID:-${UID}}\" == \"0\" ]] || return\n" +
"\n" +
"  # Allow Azure Pipelines/GitHub Actions/Docker/Concourse/Kubernetes to do everything as root (as it's normal there)\n" +
"  [[ -f /.dockerenv ]] && return\n" +
"  [[ -f /run/.containerenv ]] && return\n" +
"  [[ -f /proc/1/cgroup ]] && grep -E \"azpl_job|actions_job|docker|garden|kubepods\" -q /proc/1/cgroup && return\n" +
"\n" +
"  abort \"Don't run this as root!\"\n" +
"}\n" +
"\n" +
"should_install_command_line_tools() {\n" +
"  if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  if version_gt \"${macos_version}\" \"10.13\"\n" +
"  then\n" +
"    ! [[ -e \"/Library/Developer/CommandLineTools/usr/bin/git\" ]]\n" +
"  else\n" +
"    ! [[ -e \"/Library/Developer/CommandLineTools/usr/bin/git\" ]] ||\n" +
"      ! [[ -e \"/usr/include/iconv.h\" ]]\n" +
"  fi\n" +
"}\n" +
"\n" +
"get_permission() {\n" +
"  \"${STAT_PRINTF[@]}\" \"${PERMISSION_FORMAT}\" \"$1\"\n" +
"}\n" +
"\n" +
"user_only_chmod() {\n" +
"  [[ -d \"$1\" ]] && [[ \"$(get_permission \"$1\")\" != 75[0145] ]]\n" +
"}\n" +
"\n" +
"exists_but_not_writable() {\n" +
"  [[ -e \"$1\" ]] && ! [[ -r \"$1\" && -w \"$1\" && -x \"$1\" ]]\n" +
"}\n" +
"\n" +
"get_owner() {\n" +
"  \"${STAT_PRINTF[@]}\" \"%u\" \"$1\"\n" +
"}\n" +
"\n" +
"file_not_owned() {\n" +
"  [[ \"$(get_owner \"$1\")\" != \"$(id -u)\" ]]\n" +
"}\n" +
"\n" +
"get_group() {\n" +
"  \"${STAT_PRINTF[@]}\" \"%g\" \"$1\"\n" +
"}\n" +
"\n" +
"file_not_grpowned() {\n" +
"  [[ \" $(id -G \"${USER}\") \" != *\" $(get_group \"$1\") \"* ]]\n" +
"}\n" +
"\n" +
"# Please sync with 'test_ruby()' in 'Library/Homebrew/utils/ruby.sh' from the Homebrew/brew repository.\n" +
"test_ruby() {\n" +
"  if [[ ! -x \"$1\" ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  \"$1\" --enable-frozen-string-literal --disable=gems,did_you_mean,rubyopt -rrubygems -e     \"abort if Gem::Version.new(RUBY_VERSION.to_s.dup).to_s.split('.').first(2) !=               Gem::Version.new('${REQUIRED_RUBY_VERSION}').to_s.split('.').first(2)\" 2>/dev/null\n" +
"}\n" +
"\n" +
"test_curl() {\n" +
"  if [[ ! -x \"$1\" ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  local curl_version_output curl_name_and_version\n" +
"  curl_version_output=\"$(\"$1\" --version 2>/dev/null)\"\n" +
"  curl_name_and_version=\"${curl_version_output%% (*}\"\n" +
"  version_ge \"$(major_minor \"${curl_name_and_version##* }\")\" \"$(major_minor \"${REQUIRED_CURL_VERSION}\")\"\n" +
"}\n" +
"\n" +
"test_git() {\n" +
"  if [[ ! -x \"$1\" ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  local git_version_output\n" +
"  git_version_output=\"$(\"$1\" --version 2>/dev/null)\"\n" +
"  if [[ \"${git_version_output}\" =~ \"git version \"([^ ]*).* ]]\n" +
"  then\n" +
"    version_ge \"$(major_minor \"${BASH_REMATCH[1]}\")\" \"$(major_minor \"${REQUIRED_GIT_VERSION}\")\"\n" +
"  else\n" +
"    abort \"Unexpected Git version: '${git_version_output}'!\"\n" +
"  fi\n" +
"}\n" +
"\n" +
"# Search for the given executable in PATH (avoids a dependency on the `which` command)\n" +
"which() {\n" +
"  # Alias to Bash built-in command `type -P`\n" +
"  type -P \"$@\"\n" +
"}\n" +
"\n" +
"# Search PATH for the specified program that satisfies Homebrew requirements\n" +
"# function which is set above\n" +
"# shellcheck disable=SC2230\n" +
"find_tool() {\n" +
"  if [[ $# -ne 1 ]]\n" +
"  then\n" +
"    return 1\n" +
"  fi\n" +
"\n" +
"  local executable\n" +
"  while read -r executable\n" +
"  do\n" +
"    if [[ \"${executable}\" != /* ]]\n" +
"    then\n" +
"      warn \"Ignoring ${executable} (relative paths don't work)\"\n" +
"    elif \"test_$1\" \"${executable}\"\n" +
"    then\n" +
"      echo \"${executable}\"\n" +
"      break\n" +
"    fi\n" +
"  done < <(which -a \"$1\")\n" +
"}\n" +
"\n" +
"no_usable_ruby() {\n" +
"  [[ -z \"$(find_tool ruby)\" ]]\n" +
"}\n" +
"\n" +
"outdated_glibc() {\n" +
"  local glibc_version\n" +
"  glibc_version=\"$(ldd --version | head -n1 | grep -o '[0-9.]*$' | grep -o '^[0-9]\+\.[0-9]\+')\"\n" +
"  version_lt \"${glibc_version}\" \"${REQUIRED_GLIBC_VERSION}\"\n" +
"}\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]] && no_usable_ruby && outdated_glibc\n" +
"then\n" +
"  abort \"$(\n" +
"    cat <<EOABORT\n" +
"Homebrew requires Ruby ${REQUIRED_RUBY_VERSION} which was not found on your system.\n" +
"Homebrew portable Ruby requires Glibc version ${REQUIRED_GLIBC_VERSION} or newer,\n" +
"and your Glibc version is too old. See:\n" +
"  ${tty_underline}https://docs.brew.sh/Homebrew-on-Linux#requirements${tty_reset}\n" +
"Please install Ruby ${REQUIRED_RUBY_VERSION} and add its location to your PATH.\n" +
"EOABORT\n" +
"  )\"\n" +
"fi\n" +
"\n" +
"# Invalidate sudo timestamp before exiting (if it wasn't active before).\n" +
"if [[ -x /usr/bin/sudo ]] && ! /usr/bin/sudo -n -v 2>/dev/null\n" +
"then\n" +
"  trap '/usr/bin/sudo -k' EXIT\n" +
"fi\n" +
"\n" +
"# Things can fail later if `pwd` doesn't exist.\n" +
"# Also sudo prints a warning message for no good reason\n" +
"cd \"/usr\" || exit 1\n" +
"\n" +
"####################################################################### script\n" +
"\n" +
"# shellcheck disable=SC2016\n" +
"ohai 'Checking for `sudo` access (which may request your password)...'\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]]\n" +
"then\n" +
"  [[ \"${EUID:-${UID}}\" == \"0\" ]] || have_sudo_access\n" +
"elif ! [[ -w \"${HOMEBREW_PREFIX}\" ]] &&\n" +
"     ! [[ -w \"/home/linuxbrew\" ]] &&\n" +
"     ! [[ -w \"/home\" ]] &&\n" +
"     ! have_sudo_access\n" +
"then\n" +
"  abort \"$(\n" +
"    cat <<EOABORT\n" +
"Insufficient permissions to install Homebrew to \"${HOMEBREW_PREFIX}\" (the default prefix).\n" +
"\n" +
"Alternative (unsupported) installation methods are available at:\n" +
"https://docs.brew.sh/Installation#alternative-installs\n" +
"\n" +
"Please note this will require most formula to build from source, a buggy, slow and energy-inefficient experience.\n" +
"We will close any issues without response for these unsupported configurations.\n" +
"EOABORT\n" +
"  )\"\n" +
"fi\n" +
"HOMEBREW_CORE=\"${HOMEBREW_REPOSITORY}/Library/Taps/homebrew/homebrew-core\"\n" +
"\n" +
"check_run_command_as_root\n" +
"\n" +
"if [[ -d \"${HOMEBREW_PREFIX}\" && ! -x \"${HOMEBREW_PREFIX}\" ]]\n" +
"then\n" +
"  abort \"$(\n" +
"    cat <<EOABORT\n" +
"The Homebrew prefix ${tty_underline}${HOMEBREW_PREFIX}${tty_reset} exists but is not searchable.\n" +
"If this is not intentional, please restore the default permissions and\n" +
"try running the installer again:\n" +
"    sudo chmod 775 ${HOMEBREW_PREFIX}\n" +
"EOABORT\n" +
"  )\"\n" +
"fi\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]]\n" +
"then\n" +
"  # On macOS, support 64-bit Intel and ARM\n" +
"  if [[ \"${UNAME_MACHINE}\" != \"arm64\" ]] && [[ \"${UNAME_MACHINE}\" != \"x86_64\" ]]\n" +
"  then\n" +
"    abort \"Homebrew is only supported on Intel and ARM processors!\"\n" +
"  fi\n" +
"else\n" +
"  # On Linux, support only 64-bit Intel\n" +
"  if [[ \"${UNAME_MACHINE}\" == \"aarch64\" ]]\n" +
"  then\n" +
"    abort \"$(\n" +
"      cat <<EOABORT\n" +
"Homebrew on Linux is not supported on ARM processors.\n" +
"  ${tty_underline}https://docs.brew.sh/Homebrew-on-Linux#arm-unsupported${tty_reset}\n" +
"EOABORT\n" +
"    )\"\n" +
"  elif [[ \"${UNAME_MACHINE}\" != \"x86_64\" ]]\n" +
"  then\n" +
"    abort \"Homebrew on Linux is only supported on Intel processors!\"\n" +
"  fi\n" +
"fi\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]]\n" +
"then\n" +
"  macos_version=\"$(major_minor \"$(/usr/bin/sw_vers -productVersion)\")\"\n" +
"  if version_lt \"${macos_version}\" \"10.7\"\n" +
"  then\n" +
"    abort \"$(\n" +
"      cat <<EOABORT\n" +
"Your Mac OS X version is too old. See:\n" +
"  ${tty_underline}https://github.com/mistydemeo/tigerbrew${tty_reset}\n" +
"EOABORT\n" +
"    )\"\n" +
"  elif version_lt \"${macos_version}\" \"10.11\"\n" +
"  then\n" +
"    abort \"Your OS X version is too old.\"\n" +
"  elif version_ge \"${macos_version}\" \"${MACOS_NEWEST_UNSUPPORTED}\" ||\n" +
"       version_lt \"${macos_version}\" \"${MACOS_OLDEST_SUPPORTED}\"\n" +
"  then\n" +
"    who=\"We\"\n" +
"    what=\"\"\n" +
"    if version_ge \"${macos_version}\" \"${MACOS_NEWEST_UNSUPPORTED}\"\n" +
"    then\n" +
"      what=\"pre-release version\"\n" +
"    else\n" +
"      who+=\" (and Apple)\"\n" +
"      what=\"old version\"\n" +
"    fi\n" +
"    ohai \"You are using macOS ${macos_version}.\"\n" +
"    ohai \"${who} do not provide support for this ${what}.\"\n" +
"\n" +
"    echo \"$(\n" +
"      cat <<EOS\n" +
"This installation may not succeed.\n" +
"After installation, you will encounter build failures with some formulae.\n" +
"Please create pull requests instead of asking for help on Homebrew's GitHub,\n" +
"Twitter or any other official channels. You are responsible for resolving any\n" +
"issues you experience while you are running this ${what}.\n" +
"EOS\n" +
"    )\n" +
"\" | tr -d \"\\\\\" \n" +
"  fi\n" +
"fi\n" +
"\n" +
"ohai \"This script will install:\"\n" +
"echo \"${HOMEBREW_PREFIX}/bin/brew\"\n" +
"echo \"${HOMEBREW_PREFIX}/share/doc/homebrew\"\n" +
"echo \"${HOMEBREW_PREFIX}/share/man/man1/brew.1\"\n" +
"echo \"${HOMEBREW_PREFIX}/share/zsh/site-functions/_brew\"\n" +
"echo \"${HOMEBREW_PREFIX}/etc/bash_completion.d/brew\"\n" +
"echo \"${HOMEBREW_REPOSITORY}\"\n" +
"\n" +
"# Keep relatively in sync with\n" +
"# https://github.com/Homebrew/brew/blob/master/Library/Homebrew/keg.rb\n" +
"directories=(\n" +
"  bin etc include lib sbin share opt var\n" +
"  Frameworks\n" +
"  etc/bash_completion.d lib/pkgconfig\n" +
"  share/aclocal share/doc share/info share/locale share/man\n" +
"  share/man/man1 share/man/man2 share/man/man3 share/man/man4\n" +
"  share/man/man5 share/man/man6 share/man/man7 share/man/man8\n" +
"  var/log var/homebrew var/homebrew/linked\n" +
"  bin/brew\n" +
")\n" +
"group_chmods=()\n" +
"for dir in \"${directories[@]}\"\n" +
"do\n" +
"  if exists_but_not_writable \"${HOMEBREW_PREFIX}/${dir}\"\n" +
"  then\n" +
"    group_chmods+=(\"${HOMEBREW_PREFIX}/${dir}\")\n" +
"  fi\n" +
"done\n" +
"\n" +
"# zsh refuses to read from these directories if group writable\n" +
"directories=(share/zsh share/zsh/site-functions)\n" +
"zsh_dirs=()\n" +
"for dir in \"${directories[@]}\"\n" +
"do\n" +
"  zsh_dirs+=(\"${HOMEBREW_PREFIX}/${dir}\")\n" +
"done\n" +
"\n" +
"directories=(\n" +
"  bin etc include lib sbin share var opt\n" +
"  share/zsh share/zsh/site-functions\n" +
"  var/homebrew var/homebrew/linked\n" +
"  Cellar Caskroom Frameworks\n" +
")\n" +
"mkdirs=()\n" +
"for dir in \"${directories[@]}\"\n" +
"do\n" +
"  if ! [[ -d \"${HOMEBREW_PREFIX}/${dir}\" ]]\n" +
"  then\n" +
"    mkdirs+=(\"${HOMEBREW_PREFIX}/${dir}\")\n" +
"  fi\n" +
"done\n" +
"\n" +
"user_chmods=()\n" +
"mkdirs_user_only=()\n" +
"if [[ \"${#zsh_dirs[@]}\" -gt 0 ]]\n" +
"then\n" +
"  for dir in \"${zsh_dirs[@]}\"\n" +
"  do\n" +
"    if [[ ! -d \"${dir}\" ]]\n" +
"    then\n" +
"      mkdirs_user_only+=(\"${dir}\")\n" +
"    elif user_only_chmod \"${dir}\"\n" +
"    then\n" +
"      user_chmods+=(\"${dir}\")\n" +
"    fi\n" +
"  done\n" +
"fi\n" +
"\n" +
"chmods=()\n" +
"if [[ \"${#group_chmods[@]}\" -gt 0 ]]\n" +
"then\n" +
"  chmods+=(\"${group_chmods[@]}\")\n" +
"fi\n" +
"if [[ \"${#user_chmods[@]}\" -gt 0 ]]\n" +
"then\n" +
"  chmods+=(\"${user_chmods[@]}\")\n" +
"fi\n" +
"\n" +
"chowns=()\n" +
"chgrps=()\n" +
"if [[ \"${#chmods[@]}\" -gt 0 ]]\n" +
"then\n" +
"  for dir in \"${chmods[@]}\"\n" +
"  do\n" +
"    if file_not_owned \"${dir}\"\n" +
"    then\n" +
"      chowns+=(\"${dir}\")\n" +
"    fi\n" +
"    if file_not_grpowned \"${dir}\"\n" +
"    then\n" +
"      chgrps+=(\"${dir}\")\n" +
"    fi\n" +
"  done\n" +
"fi\n" +
"\n" +
"if [[ \"${#group_chmods[@]}\" -gt 0 ]]\n" +
"then\n" +
"  ohai \"The following existing directories will be made group writable:\"\n" +
"  printf \"%s\n" +
"\" \"${group_chmods[@]}\"\n" +
"fi\n" +
"if [[ \"${#user_chmods[@]}\" -gt 0 ]]\n" +
"then\n" +
"  ohai \"The following existing directories will be made writable by user only:\"\n" +
"  printf \"%s\n" +
"\" \"${user_chmods[@]}\"\n" +
"fi\n" +
"if [[ \"${#chowns[@]}\" -gt 0 ]]\n" +
"then\n" +
"  ohai \"The following existing directories will have their owner set to ${tty_underline}${USER}${tty_reset}:\"\n" +
"  printf \"%s\n" +
"\" \"${chowns[@]}\"\n" +
"fi\n" +
"if [[ \"${#chgrps[@]}\" -gt 0 ]]\n" +
"then\n" +
"  ohai \"The following existing directories will have their group set to ${tty_underline}${GROUP}${tty_reset}:\"\n" +
"  printf \"%s\n" +
"\" \"${chgrps[@]}\"\n" +
"fi\n" +
"if [[ \"${#mkdirs[@]}\" -gt 0 ]]\n" +
"then\n" +
"  ohai \"The following new directories will be created:\"\n" +
"  printf \"%s\n" +
"\" \"${mkdirs[@]}\"\n" +
"fi\n" +
"\n" +
"if should_install_command_line_tools\n" +
"then\n" +
"  ohai \"The Xcode Command Line Tools will be installed.\"\n" +
"fi\n" +
"\n" +
"non_default_repos=\"\"\n" +
"additional_shellenv_commands=()\n" +
"if [[ \"${HOMEBREW_BREW_DEFAULT_GIT_REMOTE}\" != \"${HOMEBREW_BREW_GIT_REMOTE}\" ]]\n" +
"then\n" +
"  ohai \"HOMEBREW_BREW_GIT_REMOTE is set to a non-default URL:\"\n" +
"  echo \"${tty_underline}${HOMEBREW_BREW_GIT_REMOTE}${tty_reset} will be used as the Homebrew/brew Git remote.\"\n" +
"  non_default_repos=\"Homebrew/brew\"\n" +
"  additional_shellenv_commands+=(\"export HOMEBREW_BREW_GIT_REMOTE=\"${HOMEBREW_BREW_GIT_REMOTE}\"\")\n" +
"fi\n" +
"\n" +
"if [[ \"${HOMEBREW_CORE_DEFAULT_GIT_REMOTE}\" != \"${HOMEBREW_CORE_GIT_REMOTE}\" ]]\n" +
"then\n" +
"  ohai \"HOMEBREW_CORE_GIT_REMOTE is set to a non-default URL:\"\n" +
"  echo \"${tty_underline}${HOMEBREW_CORE_GIT_REMOTE}${tty_reset} will be used as the Homebrew/homebrew-core Git remote.\"\n" +
"  non_default_repos=\"${non_default_repos:-}${non_default_repos:+ and }Homebrew/homebrew-core\"\n" +
"  additional_shellenv_commands+=(\"export HOMEBREW_CORE_GIT_REMOTE=\"${HOMEBREW_CORE_GIT_REMOTE}\"\")\n" +
"fi\n" +
"\n" +
"if [[ -n \"${HOMEBREW_NO_INSTALL_FROM_API-}\" ]]\n" +
"then\n" +
"  ohai \"HOMEBREW_NO_INSTALL_FROM_API is set.\"\n" +
"  echo \"Homebrew/homebrew-core will be tapped during this ${tty_bold}install${tty_reset} run.\"\n" +
"fi\n" +
"\n" +
"if [[ -z \"${NONINTERACTIVE-}\" ]]\n" +
"then\n" +
"  ring_bell\n" +
"  wait_for_user\n" +
"fi\n" +
"\n" +
"if [[ -d \"${HOMEBREW_PREFIX}\" ]]\n" +
"then\n" +
"  if [[ \"${#chmods[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHMOD[@]}\" \"u+rwx\" \"${chmods[@]}\"\n" +
"  fi\n" +
"  if [[ \"${#group_chmods[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHMOD[@]}\" \"g+rwx\" \"${group_chmods[@]}\"\n" +
"  fi\n" +
"  if [[ \"${#user_chmods[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHMOD[@]}\" \"go-w\" \"${user_chmods[@]}\"\n" +
"  fi\n" +
"  if [[ \"${#chowns[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHOWN[@]}\" \"${USER}\" \"${chowns[@]}\"\n" +
"  fi\n" +
"  if [[ \"${#chgrps[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHGRP[@]}\" \"${GROUP}\" \"${chgrps[@]}\"\n" +
"  fi\n" +
"else\n" +
"  execute_sudo \"${INSTALL[@]}\" \"${HOMEBREW_PREFIX}\"\n" +
"fi\n" +
"\n" +
"if [[ \"${#mkdirs[@]}\" -gt 0 ]]\n" +
"then\n" +
"  execute_sudo \"${MKDIR[@]}\" \"${mkdirs[@]}\"\n" +
"  execute_sudo \"${CHMOD[@]}\" \"ug=rwx\" \"${mkdirs[@]}\"\n" +
"  if [[ \"${#mkdirs_user_only[@]}\" -gt 0 ]]\n" +
"  then\n" +
"    execute_sudo \"${CHMOD[@]}\" \"go-w\" \"${mkdirs_user_only[@]}\"\n" +
"  fi\n" +
"  execute_sudo \"${CHOWN[@]}\" \"${USER}\" \"${mkdirs[@]}\"\n" +
"  execute_sudo \"${CHGRP[@]}\" \"${GROUP}\" \"${mkdirs[@]}\"\n" +
"fi\n" +
"\n" +
"if ! [[ -d \"${HOMEBREW_REPOSITORY}\" ]]\n" +
"then\n" +
"  execute_sudo \"${MKDIR[@]}\" \"${HOMEBREW_REPOSITORY}\"\n" +
"fi\n" +
"execute_sudo \"${CHOWN[@]}\" \"-R\" \"${USER}:${GROUP}\" \"${HOMEBREW_REPOSITORY}\"\n" +
"\n" +
"if ! [[ -d \"${HOMEBREW_CACHE}\" ]]\n" +
"then\n" +
"  if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]]\n" +
"  then\n" +
"    execute_sudo \"${MKDIR[@]}\" \"${HOMEBREW_CACHE}\"\n" +
"  else\n" +
"    execute \"${MKDIR[@]}\" \"${HOMEBREW_CACHE}\"\n" +
"  fi\n" +
"fi\n" +
"if exists_but_not_writable \"${HOMEBREW_CACHE}\"\n" +
"then\n" +
"  execute_sudo \"${CHMOD[@]}\" \"g+rwx\" \"${HOMEBREW_CACHE}\"\n" +
"fi\n" +
"if file_not_owned \"${HOMEBREW_CACHE}\"\n" +
"then\n" +
"  execute_sudo \"${CHOWN[@]}\" \"-R\" \"${USER}\" \"${HOMEBREW_CACHE}\"\n" +
"fi\n" +
"if file_not_grpowned \"${HOMEBREW_CACHE}\"\n" +
"then\n" +
"  execute_sudo \"${CHGRP[@]}\" \"-R\" \"${GROUP}\" \"${HOMEBREW_CACHE}\"\n" +
"fi\n" +
"if [[ -d \"${HOMEBREW_CACHE}\" ]]\n" +
"then\n" +
"  execute \"${TOUCH[@]}\" \"${HOMEBREW_CACHE}/.cleaned\"\n" +
"fi\n" +
"\n" +
"if should_install_command_line_tools && version_ge \"${macos_version}\" \"10.13\"\n" +
"then\n" +
"  ohai \"Searching online for the Command Line Tools\"\n" +
"  # This temporary file prompts the 'softwareupdate' utility to list the Command Line Tools\n" +
"  clt_placeholder=\"/tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress\"\n" +
"  execute_sudo \"${TOUCH[@]}\" \"${clt_placeholder}\"\n" +
"\n" +
"  clt_label_command=\"/usr/sbin/softwareupdate -l |\n" +
"                      grep -B 1 -E 'Command Line Tools' |\n" +
"                      awk -F'*' '/^ *\*/ {print \$2}' |\n" +
"                      sed -e 's/^ *Label: //' -e 's/^ *//' |\n" +
"                      sort -V |\n" +
"                      tail -n1\"\n" +
"  clt_label=\"$(chomp \"$(/bin/bash -c \"${clt_label_command}\")\")\"\n" +
"\n" +
"  if [[ -n \"${clt_label}\" ]]\n" +
"  then\n" +
"    ohai \"Installing ${clt_label}\"\n" +
"    execute_sudo \"/usr/sbin/softwareupdate\" \"-i\" \"${clt_label}\"\n" +
"    execute_sudo \"/usr/bin/xcode-select\" \"--switch\" \"/Library/Developer/CommandLineTools\"\n" +
"  fi\n" +
"  execute_sudo \"/bin/rm\" \"-f\" \"${clt_placeholder}\"\n" +
"fi\n" +
"\n" +
"# Headless install may have failed, so fallback to original 'xcode-select' method\n" +
"if should_install_command_line_tools && test -t 0\n" +
"then\n" +
"  ohai \"Installing the Command Line Tools (expect a GUI popup):\"\n" +
"  execute \"/usr/bin/xcode-select\" \"--install\"\n" +
"  echo \"Press any key when the installation has completed.\"\n" +
"  getc\n" +
"  execute_sudo \"/usr/bin/xcode-select\" \"--switch\" \"/Library/Developer/CommandLineTools\"\n" +
"fi\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_MACOS-}\" ]] && ! output=\"$(/usr/bin/xcrun clang 2>&1)\" && [[ \"${output}\" == *\"license\"* ]]\n" +
"then\n" +
"  abort \"$(\n" +
"    cat <<EOABORT\n" +
"You have not agreed to the Xcode license.\n" +
"Before running the installer again please agree to the license by opening\n" +
"Xcode.app or running:\n" +
"    sudo xcodebuild -license\n" +
"EOABORT\n" +
"  )\"\n" +
"fi\n" +
"\n" +
"USABLE_GIT=/usr/bin/git\n" +
"if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"then\n" +
"  USABLE_GIT=\"$(find_tool git)\"\n" +
"  if [[ -z \"$(command -v git)\" ]]\n" +
"  then\n" +
"    abort \"$(\n" +
"      cat <<EOABORT\n" +
"  You must install Git before installing Homebrew. See:\n" +
"    ${tty_underline}https://docs.brew.sh/Installation${tty_reset}\n" +
"EOABORT\n" +
"    )\"\n" +
"  fi\n" +
"  if [[ -z \"${USABLE_GIT}\" ]]\n" +
"  then\n" +
"    abort \"$(\n" +
"      cat <<EOABORT\n" +
"  The version of Git that was found does not satisfy requirements for Homebrew.\n" +
"  Please install Git ${REQUIRED_GIT_VERSION} or newer and add it to your PATH.\n" +
"EOABORT\n" +
"    )\"\n" +
"  fi\n" +
"  if [[ \"${USABLE_GIT}\" != /usr/bin/git ]]\n" +
"  then\n" +
"    export HOMEBREW_GIT_PATH=\"${USABLE_GIT}\"\n" +
"    ohai \"Found Git: ${HOMEBREW_GIT_PATH}\"\n" +
"  fi\n" +
"fi\n" +
"\n" +
"if ! command -v curl >/dev/null\n" +
"then\n" +
"  abort \"$(\n" +
"    cat <<EOABORT\n" +
"You must install cURL before installing Homebrew. See:\n" +
"  ${tty_underline}https://docs.brew.sh/Installation${tty_reset}\n" +
"EOABORT\n" +
"  )\"\n" +
"elif [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"then\n" +
"  USABLE_CURL=\"$(find_tool curl)\"\n" +
"  if [[ -z \"${USABLE_CURL}\" ]]\n" +
"  then\n" +
"    abort \"$(\n" +
"      cat <<EOABORT\n" +
"The version of cURL that was found does not satisfy requirements for Homebrew.\n" +
"Please install cURL ${REQUIRED_CURL_VERSION} or newer and add it to your PATH.\n" +
"EOABORT\n" +
"    )\"\n" +
"  elif [[ \"${USABLE_CURL}\" != /usr/bin/curl ]]\n" +
"  then\n" +
"    export HOMEBREW_CURL_PATH=\"${USABLE_CURL}\"\n" +
"    ohai \"Found cURL: ${HOMEBREW_CURL_PATH}\"\n" +
"  fi\n" +
"fi\n" +
"\n" +
"ohai \"Downloading and installing Homebrew...\"\n" +
"(\n" +
"  cd \"${HOMEBREW_REPOSITORY}\" >/dev/null || return\n" +
"\n" +
"  # we do it in four steps to avoid merge errors when reinstalling\n" +
"  execute \"${USABLE_GIT}\" \"-c\" \"init.defaultBranch=master\" \"init\" \"--quiet\"\n" +
"\n" +
"  # \"git remote add\" will fail if the remote is defined in the global config\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"remote.origin.url\" \"${HOMEBREW_BREW_GIT_REMOTE}\"\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"remote.origin.fetch\" \"+refs/heads/*:refs/remotes/origin/*\"\n" +
"\n" +
"  # ensure we don't munge line endings on checkout\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"--bool\" \"core.autocrlf\" \"false\"\n" +
"\n" +
"  # make sure symlinks are saved as-is\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"--bool\" \"core.symlinks\" \"true\"\n" +
"\n" +
"  execute \"${USABLE_GIT}\" \"fetch\" \"--force\" \"origin\"\n" +
"  execute \"${USABLE_GIT}\" \"fetch\" \"--force\" \"--tags\" \"origin\"\n" +
"  execute \"${USABLE_GIT}\" \"remote\" \"set-head\" \"origin\" \"--auto\" >/dev/null\n" +
"\n" +
"  LATEST_GIT_TAG=\"$(\"${USABLE_GIT}\" tag --list --sort=\"-version:refname\" | head -n1)\"\n" +
"  if [[ -z \"${LATEST_GIT_TAG}\" ]]\n" +
"  then\n" +
"    abort \"Failed to query latest Homebrew/brew Git tag.\"\n" +
"  fi\n" +
"  execute \"${USABLE_GIT}\" \"checkout\" \"--force\" \"-B\" \"stable\" \"${LATEST_GIT_TAG}\"\n" +
"\n" +
"  if [[ \"${HOMEBREW_REPOSITORY}\" != \"${HOMEBREW_PREFIX}\" ]]\n" +
"  then\n" +
"    if [[ \"${HOMEBREW_REPOSITORY}\" == \"${HOMEBREW_PREFIX}/Homebrew\" ]]\n" +
"    then\n" +
"      execute \"ln\" \"-sf\" \"../Homebrew/bin/brew\" \"${HOMEBREW_PREFIX}/bin/brew\"\n" +
"    else\n" +
"      abort \"The Homebrew/brew repository should be placed in the Homebrew prefix directory.\"\n" +
"    fi\n" +
"  fi\n" +
"\n" +
"  if [[ -n \"${HOMEBREW_NO_INSTALL_FROM_API-}\" && ! -d \"${HOMEBREW_CORE}\" ]]\n" +
"  then\n" +
"    # Always use single-quoted strings with `exp` expressions\n" +
"    # shellcheck disable=SC2016\n" +
"    ohai 'Tapping homebrew/core because `$HOMEBREW_NO_INSTALL_FROM_API` is set.'\n" +
"    (\n" +
"      execute \"${MKDIR[@]}\" \"${HOMEBREW_CORE}\"\n" +
"      cd \"${HOMEBREW_CORE}\" >/dev/null || return\n" +
"\n" +
"      execute \"${USABLE_GIT}\" \"-c\" \"init.defaultBranch=master\" \"init\" \"--quiet\"\n" +
"      execute \"${USABLE_GIT}\" \"config\" \"remote.origin.url\" \"${HOMEBREW_CORE_GIT_REMOTE}\"\n" +
"      execute \"${USABLE_GIT}\" \"config\" \"remote.origin.fetch\" \"+refs/heads/*:refs/remotes/origin/*\"\n" +
"      execute \"${USABLE_GIT}\" \"config\" \"--bool\" \"core.autocrlf\" \"false\"\n" +
"      execute \"${USABLE_GIT}\" \"config\" \"--bool\" \"core.symlinks\" \"true\"\n" +
"      execute \"${USABLE_GIT}\" \"fetch\" \"--force\" \"origin\" \"refs/heads/master:refs/remotes/origin/master\"\n" +
"      execute \"${USABLE_GIT}\" \"remote\" \"set-head\" \"origin\" \"--auto\" >/dev/null\n" +
"      execute \"${USABLE_GIT}\" \"reset\" \"--hard\" \"origin/master\"\n" +
"\n" +
"      cd \"${HOMEBREW_REPOSITORY}\" >/dev/null || return\n" +
"    ) || exit 1\n" +
"  fi\n" +
"\n" +
"  execute \"${HOMEBREW_PREFIX}/bin/brew\" \"update\" \"--force\" \"--quiet\"\n" +
") || exit 1\n" +
"\n" +
"if [[ \":${PATH}:\" != *\":${HOMEBREW_PREFIX}/bin:\"* ]]\n" +
"then\n" +
"  warn \"${HOMEBREW_PREFIX}/bin is not in your PATH.\n" +
"  Instructions on how to configure your shell for Homebrew\n" +
"  can be found in the 'Next steps' section below.\"\n" +
"fi\n" +
"\n" +
"ohai \"Installation successful!\"\n" +
"echo\n" +
"\n" +
"ring_bell\n" +
"\n" +
"# Use an extra newline and bold to avoid this being missed.\n" +
"ohai \"Homebrew has enabled anonymous aggregate formulae and cask analytics.\"\n" +
"echo \"$(\n" +
"  cat <<EOS\n" +
"${tty_bold}Read the analytics documentation (and how to opt-out) here:\n" +
"  ${tty_underline}https://docs.brew.sh/Analytics${tty_reset}\n" +
"No analytics data has been sent yet (nor will any be during this ${tty_bold}install${tty_reset} run).\n" +
"EOS\n" +
")\n" +
"\"\n" +
"\n" +
"ohai \"Homebrew is run entirely by unpaid volunteers. Please consider donating:\"\n" +
"echo \"$(\n" +
"  cat <<EOS\n" +
"  ${tty_underline}https://github.com/Homebrew/brew#donations${tty_reset}\n" +
"EOS\n" +
")\n" +
"\"\n" +
"\n" +
"(\n" +
"  cd \"${HOMEBREW_REPOSITORY}\" >/dev/null || return\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"--replace-all\" \"homebrew.analyticsmessage\" \"true\"\n" +
"  execute \"${USABLE_GIT}\" \"config\" \"--replace-all\" \"homebrew.caskanalyticsmessage\" \"true\"\n" +
") || exit 1\n" +
"\n" +
"ohai \"Next steps:\"\n" +
"case \"${SHELL}\" in\n" +
"  */bash*)\n" +
"    if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"    then\n" +
"      shell_rcfile=\"${HOME}/.bashrc\"\n" +
"    else\n" +
"      shell_rcfile=\"${HOME}/.bash_profile\"\n" +
"    fi\n" +
"    ;;\n" +
"  */zsh*)\n" +
"    if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"    then\n" +
"      shell_rcfile=\"${ZDOTDIR:-\"${HOME}\"}/.zshrc\"\n" +
"    else\n" +
"      shell_rcfile=\"${ZDOTDIR:-\"${HOME}\"}/.zprofile\"\n" +
"    fi\n" +
"    ;;\n" +
"  */fish*)\n" +
"    shell_rcfile=\"${HOME}/.config/fish/config.fish\"\n" +
"    ;;\n" +
"  *)\n" +
"    shell_rcfile=\"${ENV:-\"${HOME}/.profile\"}\"\n" +
"    ;;\n" +
"esac\n" +
"\n" +
"if grep -qs \"eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"\" \"${shell_rcfile}\"\n" +
"then\n" +
"  if ! [[ -x \"$(command -v brew)\" ]]\n" +
"  then\n" +
"    cat <<EOS\n" +
"- Run this command in your terminal to add Homebrew to your ${tty_bold}PATH${tty_reset}:\n" +
"    eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"\n" +
"EOS\n" +
"  fi\n" +
"else\n" +
"  cat <<EOS\n" +
"- Run these two commands in your terminal to add Homebrew to your ${tty_bold}PATH${tty_reset}:\n" +
"    (echo; echo 'eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"') >> ${shell_rcfile}\n" +
"    eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"\n" +
"EOS\n" +
"fi\n" +
"\n" +
"if [[ -n \"${non_default_repos}\" ]]\n" +
"then\n" +
"  plural=\"\"\n" +
"  if [[ \"${#additional_shellenv_commands[@]}\" -gt 1 ]]\n" +
"  then\n" +
"    plural=\"s\"\n" +
"  fi\n" +
"  printf -- \"- Run these commands in your terminal to add the non-default Git remote%s for %s:\n" +
"\" \"${plural}\" \"${non_default_repos}\"\n" +
"  printf \"    echo '# Set PATH, MANPATH, etc., for Homebrew.' >> %s\n" +
"\" \"${shell_rcfile}\"\n" +
"  printf \"    echo '%s' >> ${shell_rcfile}\n" +
"\" \"${additional_shellenv_commands[@]}\"\n" +
"  printf \"    %s\n" +
"\" \"${additional_shellenv_commands[@]}\"\n" +
"fi\n" +
"\n" +
"if [[ -n \"${HOMEBREW_ON_LINUX-}\" ]]\n" +
"then\n" +
"  echo \"- Install Homebrew's dependencies if you have sudo access:\"\n" +
"\n" +
"  if [[ -x \"$(command -v apt-get)\" ]]\n" +
"  then\n" +
"    echo \"    sudo apt-get install build-essential\"\n" +
"  elif [[ -x \"$(command -v yum)\" ]]\n" +
"  then\n" +
"    echo \"    sudo yum groupinstall 'Development Tools'\"\n" +
"  elif [[ -x \"$(command -v pacman)\" ]]\n" +
"  then\n" +
"    echo \"    sudo pacman -S base-devel\"\n" +
"  elif [[ -x \"$(command -v apk)\" ]]\n" +
"  then\n" +
"    echo \"    sudo apk add build-base\"\n" +
"  fi\n" +
"\n" +
"  cat <<EOS\n" +
"  For more information, see:\n" +
"    ${tty_underline}https://docs.brew.sh/Homebrew-on-Linux${tty_reset}\n" +
"- We recommend that you install GCC:\n" +
"    brew install gcc\n" +
"EOS\n" +
"fi\n" +
"\n" +
"cat <<EOS\n" +
"- Run ${tty_bold}brew help${tty_reset} to get started\n" +
"- Further documentation:\n" +
"    ${tty_underline}https://docs.brew.sh${tty_reset}\n" +
"\n" +
"EOS\n" 


module.exports = {
    BrewScript
}