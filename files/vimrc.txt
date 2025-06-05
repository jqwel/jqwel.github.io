"USAGE
"git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim
":PluginInstall

"解决crontab -e时，提示crontab: temp file must be edited in place
autocmd FileType crontab setlocal nobackup nowritebackup

let $Author = $USER
if $Author == 'root' || $Author == 'jq' || $Author == 'wel' || $Author == 'ho'
  let $Author = 'jqwel'
endif
let $Email = '879202817@qq.com'

" let mapleader=","
nnoremap <leader>h :set filetype=html<cr>
nnoremap <leader>p :set paste<CR>
nnoremap <leader>pp :set nopaste<CR>
nnoremap <TAB> :tabnext<CR>
nnoremap <S-TAB> :tabprev<CR>
nnoremap <silent> <F12>   :%s/[ \t\r]\+$//g<CR>
nnoremap <leader><leader> :%s/[ \t\r]\+$//g<CR>
nnoremap <leader>b :%g/^s*$/d<CR>
nnoremap <leader>; :Tab /:<CR>
nnoremap <leader>= :Tab /=<CR>
"<leader>d
function! Doc()
    call append(line("."),  "\/**")
    call append(line(".")+1, " * @author: ".$Author)
    call append(line(".")+2, " * @param:")
    call append(line(".")+3, " * @return:")
    call append(line(".")+4, " * @throws:")
    call append(line(".")+5, " * Brief:")
    call append(line(".")+6, " * Created Date: ".strftime("%Y-%m-%d"))
    call append(line(".")+7, " * Last Change: ".strftime("%Y-%m-%d"))
    call append(line(".")+8, " * *\/")
    call append(line(".")+9, "function () {")
    call append(line(".")+10, "  \"use strict\";")
    call append(line(".")+11, "};")
    call append(line(".")+12, "")
endfunction
nnoremap <leader>d :call Doc()<CR>

function! MySys()
    if has("win16") || has("win32") || has("win64") || has("win95")
        return "windows"
    elseif has("unix")
        return "linux"
    elseif has("mac")
        return "mac"
    endif
endfunction

" 用户目录变量$VIMFILES
if MySys() == "windows"
    let $VIMFILES = $VIM.'/vimfiles'
elseif MySys() == "linux"
    let $VIMFILES = $HOME.'/.vim'
    source /etc/vimrc
elseif MySys() == "mac"
    "source /usr/share/vim/vimrc
endif


"set mouse=a
set showtabline=2
set nolist
set nopaste
set autoindent
set smartindent
set cindent
set lbr
set fo+=mB
set scrolloff=3
set ts=2
set sw=2
set si
set expandtab
set nobackup
set nu
set enc=utf8
set hls
set is
set ic
set ignorecase smartcase
set wrapscan
set noerrorbells
set novisualbell
set magic
set ruler
set t_Co=256
set autochdir
"set showmatch
"set matchtime=5
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'
Plugin 'godlygeek/tabular'
":Tab/=
":Tab/:
":Tab/|

" The following are examples of different formats supported.
" Keep Plugin commands between vundle#begin/end.
" plugin on GitHub repo
" Plugin 'tpope/vim-fugitive'
" plugin from http://vim-scripts.org/vim/scripts.html
" Plugin 'L9'
" Git plugin not hosted on GitHub
" Plugin 'git://git.wincent.com/command-t.git'
" git repos on your local machine (i.e. when working on your own plugin)
" Plugin 'file:///home/gmarik/path/to/plugin'
" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
" Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
" Avoid a name conflict with L9
" Plugin 'user/L9', {'name': 'newL9'}
"垂直缩进显示
" Plugin 'apacal/vim-indent-guides'

Bundle 'The-NERD-tree'
Plugin 'mattn/emmet-vim'
Plugin 'Shougo/neocomplcache.vim'

" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line
" autocmd vimenter * NERDTree
nmap <leader>nt :NERDTree<cr>:set rnu<cr>
let NERDTreeShowBookmarks=1
let NERDTreeShowFiles=1
let NERDTreeShowHidden=1
let NERDTreeIgnore=['\.$','\~$']
let NERDTreeShowLineNumbers=1
let NERDTreeWinPos=0
map <F8> :NERDTree<CR>
map <F9> :NERDTreeClose<CR>
map <C-n> :NERDTreeToggle<CR>
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTreeType") && b:NERDTreeType == "primary") | q | endif

"Note: This option must set it in .vimrc(_vimrc).  NOT IN .gvimrc(_gvimrc)!
" Disable AutoComplPop.
let g:acp_enableAtStartup = 0
" Use neocomplcache.
let g:neocomplcache_enable_at_startup = 1
" Use smartcase.
let g:neocomplcache_enable_smart_case = 1
" Set minimum syntax keyword length.
let g:neocomplcache_min_syntax_length = 3
let g:neocomplcache_lock_buffer_name_pattern = '\*ku\*'

" Enable heavy features.
" Use camel case completion.
"let g:neocomplcache_enable_camel_case_completion = 1
" Use underbar completion.
"let g:neocomplcache_enable_underbar_completion = 1

" Define dictionary.
let g:neocomplcache_dictionary_filetype_lists = {
    \ 'default' : '',
    \ 'vimshell' : $HOME.'/.vimshell_hist',
    \ 'scheme' : $HOME.'/.gosh_completions'
        \ }

" Define keyword.
if !exists('g:neocomplcache_keyword_patterns')
    let g:neocomplcache_keyword_patterns = {}
endif
let g:neocomplcache_keyword_patterns['default'] = '\h\w*'

" Plugin key-mappings.
inoremap <expr><C-g>     neocomplcache#undo_completion()
inoremap <expr><C-l>     neocomplcache#complete_common_string()

" Recommended key-mappings.
" <CR>: close popup and save indent.
inoremap <silent> <CR> <C-r>=<SID>my_cr_function()<CR>
function! s:my_cr_function()
  return neocomplcache#smart_close_popup() . "\<CR>"
  " For no inserting <CR> key.
  "return pumvisible() ? neocomplcache#close_popup() : "\<CR>"
endfunction
" <TAB>: completion.
inoremap <expr><TAB>  pumvisible() ? "\<C-n>" : "\<TAB>"
" <C-h>, <BS>: close popup and delete backword char.
inoremap <expr><C-h> neocomplcache#smart_close_popup()."\<C-h>"
inoremap <expr><BS> neocomplcache#smart_close_popup()."\<C-h>"
"""inoremap <expr><C-y>  neocomplcache#close_popup()
"""inoremap <expr><C-e>  neocomplcache#cancel_popup()
" Close popup by <Space>.
"inoremap <expr><Space> pumvisible() ? neocomplcache#close_popup() : "\<Space>"

" For cursor moving in insert mode(Not recommended)
"inoremap <expr><Left>  neocomplcache#close_popup() . "\<Left>"
"inoremap <expr><Right> neocomplcache#close_popup() . "\<Right>"
"inoremap <expr><Up>    neocomplcache#close_popup() . "\<Up>"
"inoremap <expr><Down>  neocomplcache#close_popup() . "\<Down>"
" Or set this.
"let g:neocomplcache_enable_cursor_hold_i = 1
" Or set this.
"let g:neocomplcache_enable_insert_char_pre = 1

" AutoComplPop like behavior.
"let g:neocomplcache_enable_auto_select = 1

" Shell like behavior(not recommended).
"set completeopt+=longest
"let g:neocomplcache_enable_auto_select = 1
"let g:neocomplcache_disable_auto_complete = 1
"inoremap <expr><TAB>  pumvisible() ? "\<Down>" : "\<C-x>\<C-u>"

" Enable omni completion.
autocmd FileType css setlocal omnifunc=csscomplete#CompleteCSS
autocmd FileType html,markdown setlocal omnifunc=htmlcomplete#CompleteTags
autocmd FileType javascript setlocal omnifunc=javascriptcomplete#CompleteJS
autocmd FileType python setlocal omnifunc=pythoncomplete#Complete
autocmd FileType xml setlocal omnifunc=xmlcomplete#CompleteTags

" Enable heavy omni completion.
if !exists('g:neocomplcache_force_omni_patterns')
  let g:neocomplcache_force_omni_patterns = {}
endif
let g:neocomplcache_force_omni_patterns.php = '[^. \t]->\h\w*\|\h\w*::'
let g:neocomplcache_force_omni_patterns.c = '[^.[:digit:] *\t]\%(\.\|->\)'
let g:neocomplcache_force_omni_patterns.cpp = '[^.[:digit:] *\t]\%(\.\|->\)\|\h\w*::'

" For perlomni.vim setting.
" https://github.com/c9s/perlomni.vim
let g:neocomplcache_force_omni_patterns.perl = '\h\w*->\h\w*\|\h\w*::'


syntax on
filetype plugin indent on
set completeopt=longest,menu
set wildmenu
autocmd FileType ruby,eruby set omnifunc=rubycomplete#Complete
autocmd FileType python set omnifunc=pythoncomplete#Complete
autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
autocmd FileType html set omnifunc=htmlcomplete#CompleteTags
autocmd FileType css set omnifunc=csscomplete#CompleteCSS
autocmd FileType xml set omnifunc=xmlcomplete#CompleteTags
autocmd FileType java set omnifunc=javacomplete#Complet
let &t_ti = "[?47h"
let &t_te = "[?47l"

"inoremap ( ()<Esc>i
"inoremap [ []<Esc>i
"inoremap { {<CR>}<Esc>O
"autocmd Syntax html,vim inoremap < <lt>><Esc>i| inoremap > <c-r>=ClosePair('>')<CR>
"inoremap ) <c-r>=ClosePair(')')<CR>
"inoremap ] <c-r>=ClosePair(']')<CR>
"inoremap } <c-r>=CloseBracket()<CR>
"inoremap " <c-r>=QuoteDelim('"')<CR>
"inoremap ' <c-r>=QuoteDelim("'")<CR>
"
"function ClosePair(char)
" if getline('.')[col('.') - 1] == a:char
" return "\<Right>"
" else
" return a:char
" endif
"endf
"
"function CloseBracket()
" if match(getline(line('.') + 1), '\s*}') < 0
" return "\<CR>}"
" else
" return "\<Esc>j0f}a"
" endif
"endf
"
"function QuoteDelim(char)
" let line = getline('.')
" let col = col('.')
" if line[col - 2] == "\\"
" "Inserting a quoted quotation mark into the string
" return a:char
" elseif line[col - 1] == a:char
" "Escaping out of the string
" return "\<Right>"
" else
" "Starting a string
" return a:char.a:char."\<Esc>i"
" endif
"endf

autocmd BufNewFile,BufRead *.html,*.htm,*.css,*.js set expandtab tabstop=2 shiftwidth=2

autocmd BufNewFile *.cpp,*.[ch],*.cc,*.sh,*.js exec ":call SetTitle()"
"新建.py,.cc,.java,.sh,
func CInclude ()
    if tolower(expand("%:t:r")) != 'main'
      call append(line(".")+7,"#include \"".expand("%:t:r").".h\"")
    else
      call append(line(".")+7,"")
    endif
endfunc
""定义函数SetTitle，自动插入文件头
func SetTitle()
        "如果文件类型为.sh文件
    if &filetype == 'sh'
        call setline(1,"\#!/usr/bin/env bash")
        call append(line("."),"\#########################################################################")
        call append(line(".")+1, "\# File Name: ".expand("%"))
        call append(line(".")+2, "\# Author: ".$Author)
        call append(line(".")+3, "\# mail: ".$Email)
        call append(line(".")+4, "\# Created Time: ".strftime("%c"))
        call append(line(".")+5, "\#########################################################################")
        call append(line(".")+6, "PATH=$PATH")
        call append(line(".")+7, "cd $(dirname $0)")
        call append(line(".")+8, "")
    else
        call setline(1, "/*************************************************************************")
        call append(line("."), "    > File Name: ".expand("%"))
        call append(line(".")+1, "    > Author: ".$Author)
        call append(line(".")+2, "    > Mail: ".$Email)
        call append(line(".")+3, "    > Created Time: ".strftime("%c"))
        call append(line(".")+4, " ************************************************************************/")
        call append(line(".")+5, "")

        if expand("%:e") == 'h'
  call append(line(".")+6, "#ifndef _".toupper(expand("%:t:r"))."_H")
  call append(line(".")+7, "#define _".toupper(expand("%:t:r"))."_H")
  call append(line(".")+8, " ")
  call append(line(".")+9, "#endif //_".toupper(expand("%:t:r"))."_H")
        elseif expand("%:e") == 'cpp'
            call append(line(".")+6, "#include <iostream>")
            call CInclude()
            if tolower(expand("%:t:r")) == 'main'
                call append(line(".")+8, "int main () {")
                call append(line(".")+9, "    using namespace std;")
                call append(line(".")+10, "    return 0;")
                call append(line(".")+11, "}")
                call append(line(".")+12, "")
            else
                call append(line(".")+8, "")
            endif
        elseif expand("%:e") == 'c'
            call append(line(".")+6, "#include <stdio.h>")
            call CInclude()
            if tolower(expand("%:t:r")) == 'main'
                call append(line(".")+8, "int main () {")
                call append(line(".")+9, "    return 0;")
                call append(line(".")+10, "}")
                call append(line(".")+11, "")
            else
                call append(line(".")+8, "")
            endif
        elseif expand("%:e") == 'js'
            call append(line(".")+6, "(function () {")
            call append(line(".")+7, "  \"use strict\";")
            call append(line(".")+8, "})();")
            call append(line(".")+9, "")
        endif
    endif
    autocmd BufNewFile * normal G
endfunc

" 设定doc文档目录
let helptags=$VIMFILES.'/doc'

" 设置字体 以及中文支持
if has("win32")
    set guifont=Inconsolata:h12:cANSI
endif

" 配置多语言环境
if has("multi_byte")
    " UTF-8 编码
    set encoding=utf-8
    set termencoding=utf-8
    set formatoptions+=mM
    "set fencs=utf-8,gbk
    set fencs=utf-8,ucs-bom,shift-jis,gb18030,gbk,gb2312,cp936

    if v:lang =~? '^\(zh\)\|\(ja\)\|\(ko\)'
        set ambiwidth=double
    endif

    if has("win32")
        source $VIMRUNTIME/delmenu.vim
        source $VIMRUNTIME/menu.vim
        language messages zh_CN.utf-8
    endif
else
    echoerr "Sorry, this version of (g)vim was not compiled with +multi_byte"
endif

"autocmd BufWritePost ~/.vimrc :source %
"autocmd BufWritePost ~/.bashrc :source %

function! PythonLoad()
  syn match pythonError "^\s*def\s\+\w\+(.*)\s*$" display
  syn match pythonError "^\s*class\s\+\w\+(.*)\s*$" display
  syn match pythonError "^\s*for\s.*[^:]$" display
  syn match pythonError "^\s*except\s*$" display
  syn match pythonError "^\s*finally\s*$" display
  syn match pythonError "^\s*try\s*$" display
  syn match pythonError "^\s*else\s*$" display
  syn match pythonError "^\s*else\s*[^:].*" display
  "syn match pythonError "^\s*if\s.*[^\:]$" display
  syn match pythonError "^\s*except\s.*[^\:]$" display
  syn match pythonError "[;]$" display
  syn keyword pythonError do

  let python_highlight_all=1
  let python_highlight_builtins=1
  let python_highlight_exceptions=1
  let python_highlight_string_formatting=1
  let python_highlight_sting_templates=1
  let python_highlight_indent_errors=1
  let python_highlight_space_errors=1
  let python_highlight_doctests=1

endfunction

function! JavaLoad()
  let java_highlight_all=1
  let java_highlight_debug=1
  let java_ignore_javadoc=1
  let java_highlight_functions=1
  let java_mark_braces_in_parens_as_errors=1
endfunction
function! RubyLoad()
  let g:rubycomplete_buffer_loading=1
  let g:rubycomplete_rails=1
  let g:rubycomplete_classes_in_global=1
  let g:rubycomplete_include_object=1
  let g:rubycomplete_include_objectspace=1
endfunction

if has("autocmd")

  autocmd FileType python set omnifunc=pythoncomplete#Complete
  autocmd FileType htmldjango.html set omnifunc=htmlcomplete#CompleteTags
  autocmd FileType python call PythonLoad()
  autocmd FileType c set omnifunc=ccomplete#Complete
  autocmd FileType ada set omnifunc=adacomplete#Complete
  autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
  autocmd FileType java set omnifunc=javacomplete#Complete
  autocmd FileType java call JavaLoad()
  autocmd FileType html set omnifunc=htmlcomplete#CompleteTags
  autocmd FileType phtml set omnifunc=htmlcomplete#CompleteTags
  autocmd FileType css set omnifunc=csscomplete#CompleteCSS
  autocmd FileType xml set omnifunc=xmlcomplete#CompleteTags
  autocmd FileType php set omnifunc=phpcomplete#CompletePHP
  autocmd FileType ruby,eruby set omnifunc=rubycomplete#Completeruby
  autocmd FileType ruby,eruby call RubyLoad()
  autocmd FileType sql set omnifunc=sqlcomplete#Completesql
endif
set confirm
set laststatus=2
set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}][HEX=%B]\ [TYPE=%Y]\ [POS=%l,%v][%p%%]\ %{strftime(\"%Y-%m-%d\ %H:%M:%S\")}
highlight StatusLineNC ctermfg=lightgray ctermbg=black

au BufWritePost *.sh !chmod u+x %
au BufWritePost *.pl !chmod u+x %
au BufWritePost *.py !chmod u+x %

set langmenu=zh_CN.utf-8

"" C的编译和运行
"map <C-c> :call CompileRunGcc()<CR>
"func! CompileRunGcc()
"exec "w"
"exec "!gcc % -o %<"
"exec "! ./%<"
"endfunc
"" C++的编译和运行
"map <C-g> :call CompileRunGpp()<CR>
"func! CompileRunGpp()
"exec "w"
"exec "!g++ % -o %<"
"exec "! ./%<"
"endfunction

"set foldenable
"set foldmethod=manual
"nnoremap <space> @=((foldclosed(line('.')) < 0) ? 'zc' : 'zo')<CR>

"set shortmess=atI
if $TERM =~ '^xterm'
set t_Co=256
elseif $TERM =~ '^screen-bce'
set t_Co=256
elseif $TERM =~ '^rxvt'
set t_Co=88
elseif $TERM =~ '^linux'
set t_Co=8
else
set t_Co=16
endif

au BufReadPost * if line("'\"") > 0|if line("'\"") <= line("$")|exe("norm '\"")|else|exe "norm $"|endif|endif

autocmd FileType c,cpp set ts=4 sw=4
"autocmd FileType php set ts=4 sw=4
